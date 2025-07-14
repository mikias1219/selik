import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { validateToken, showToast, sanitizeFilename } from "@/lib/utils";

type CartItem = {
  id: string;
  title: string;
  price: number;
  type: string;
  thumbnail?: string;
};

type PurchaseResponse = {
  id: number;
  user_id: number;
  item_id: number;
  price: string;
  purchased_at: string;
};

export const useDownloadItem = (
  selectedUsbPath: string,
  sessionDownloads: string[],
  isDownloading: string[],
  setSessionDownloads: React.Dispatch<React.SetStateAction<string[]>>,
  setIsDownloading: React.Dispatch<React.SetStateAction<string[]>>,
  purchasedItems: string[],
  setPurchasedItems: React.Dispatch<React.SetStateAction<string[]>> // Added to update purchasedItems
) => {
  const router = useRouter();

  const downloadItem = useCallback(
    async (item: CartItem, useWebSocket = true) => {
      let isMounted = true;
      if (isDownloading.includes(item.id)) {
        showToast(`Download in progress for ${item.title}`, "info");
        return;
      }

      if (sessionDownloads.includes(item.id)) {
        const confirmRedownload = window.confirm(
          `You have already downloaded "${item.title}" in this session. Download again?`
        );
        if (!confirmRedownload) return;
      }

      if (!selectedUsbPath) {
        showToast(
          "No download path selected. Please select a USB drive.",
          "error"
        );
        return;
      }

      const token = localStorage.getItem("user_token");
      if (!token || !(await validateToken(token))) {
        showToast("Invalid token. Redirecting to login.", "error");
        router.push("http://localhost:3000/");
        return;
      }

      // Check if item is purchased
      if (!purchasedItems.includes(item.id)) {
        try {
          console.log(`Purchasing item ${item.id} before download`);
          const response = await fetch(
            `http://127.0.0.1:8000/user/contents/item/${item.id}/buy`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            throw new Error(
              `Purchase failed: ${response.status} ${response.statusText}`
            );
          }
          const purchaseData: PurchaseResponse = await response.json();
          if (isMounted) {
            setPurchasedItems((prev) => [...new Set([...prev, item.id])]);
            showToast(`Successfully purchased ${item.title}`, "success");
          }
        } catch (error: any) {
          console.error("Purchase error:", error);
          if (isMounted) {
            showToast(
              `Failed to purchase ${item.title}: ${error.message}`,
              "error"
            );
          }
          return;
        }
      }

      setIsDownloading((prev) => [...prev, item.id]);
      let filename = sanitizeFilename(item.title, item.type);

      const triggerDownload = async (url: string, finalFilename: string) => {
        try {
          console.log(`Checking file availability at: ${url}`);
          // Perform a HEAD request to check if the file exists
          const headResponse = await fetch(url, {
            method: "HEAD",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!headResponse.ok) {
            throw new Error(
              `File not accessible: ${headResponse.status} ${headResponse.statusText}`
            );
          }

          console.log(`Fetching file from: ${url}`);
          const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            throw new Error(
              `Failed to fetch file: ${response.status} ${response.statusText}`
            );
          }
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = finalFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          if (isMounted) {
            setSessionDownloads((prev) => [...new Set([...prev, item.id])]);
            showToast(
              `Successfully downloaded ${item.title} to ${selectedUsbPath}/${finalFilename}!`,
              "success"
            );
          }
        } catch (error: any) {
          console.error("File fetch error:", error);
          if (isMounted) {
            // Check if the file was saved by the server despite the fetch error
            const fileCheckUrl = `http://127.0.0.1:2025/files/${encodeURIComponent(
              selectedUsbPath
            )}/${encodeURIComponent(finalFilename)}`;
            try {
              const fileCheck = await fetch(fileCheckUrl, {
                method: "HEAD",
                headers: { Authorization: `Bearer ${token}` },
              });
              if (fileCheck.ok) {
                showToast(
                  `File saved to ${selectedUsbPath}/${finalFilename}, but browser download failed: ${error.message}. Check the USB drive.`,
                  "warning",
                  { autoClose: 5000 }
                );
                setSessionDownloads((prev) => [...new Set([...prev, item.id])]);
              } else {
                showToast(
                  `Failed to download ${item.title}: ${error.message}`,
                  "error",
                  { autoClose: 5000 }
                );
              }
            } catch (checkError) {
              showToast(
                `Failed to download ${item.title}: ${error.message}`,
                "error",
                { autoClose: 5000 }
              );
            }
          }
          throw error;
        }
      };

      if (useWebSocket) {
        try {
          const ws = new WebSocket("ws://127.0.0.1:2025/ws/download");
          ws.onopen = async () => {
            console.log("WebSocket opened for:", item.title);
            await ws.send(
              JSON.stringify({
                url: `http://127.0.0.1:8000/user/contents/item/${item.id}/dl`,
                token,
                path: selectedUsbPath,
              })
            );
          };

          ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket message:", data);

            if (data.error) {
              if (isMounted) {
                showToast(`WebSocket download failed: ${data.error}`, "error");
              }
              ws.close();
              return;
            }

            if (data.status === "completed") {
              filename = data.filename
                ? sanitizeFilename(decodeURIComponent(data.filename), item.type)
                : filename;
              const contentDisposition = data.headers?.["content-disposition"];
              if (contentDisposition?.includes("filename=")) {
                const headerFilename = contentDisposition
                  .split("filename=")[1]
                  .replace(/"/g, "")
                  .trim();
                filename = sanitizeFilename(
                  decodeURIComponent(headerFilename),
                  item.type
                );
              }
              const encodedPath = encodeURIComponent(selectedUsbPath);
              const fetchUrl = `http://127.0.0.1:2025/files/${encodedPath}/${encodeURIComponent(
                filename
              )}`;
              console.log("Fetching file from:", fetchUrl);
              await triggerDownload(fetchUrl, filename);
              ws.close();
            } else if (data.downloaded && data.total) {
              const progress = ((data.downloaded / data.total) * 100).toFixed(
                1
              );
              if (isMounted) {
                showToast(
                  `Downloading ${
                    item.title
                  } to ${selectedUsbPath}: ${progress}% (${(
                    data.speed /
                    1024 /
                    1024
                  ).toFixed(2)} MB/s)`,
                  "info",
                  { autoClose: 1000 }
                );
              }
            }
          };

          ws.onerror = () => {
            console.error("WebSocket error for:", item.title);
            if (isMounted) {
              showToast(
                `WebSocket failed for ${item.title}. Falling back to HTTP.`,
                "error"
              );
            }
            ws.close();
            if (isMounted) {
              downloadItem(item, false);
            }
          };

          ws.onclose = () => {
            console.log("WebSocket closed for:", item.title);
            if (isMounted) {
              setIsDownloading((prev) => prev.filter((id) => id !== item.id));
            }
          };
        } catch (wsError) {
          console.error("WebSocket initialization error:", wsError);
          if (isMounted) {
            showToast(
              `WebSocket initialization failed for ${item.title}. Falling back to HTTP.`,
              "error"
            );
            downloadItem(item, false);
          }
        }
      } else {
        try {
          const downloadUrl = `http://127.0.0.1:8000/user/contents/item/${
            item.id
          }/dl?path=${encodeURIComponent(selectedUsbPath)}`;
          console.log("Attempting HTTP download from:", downloadUrl);
          const response = await fetch(downloadUrl, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            throw new Error(
              `HTTP download failed: ${response.status} ${response.statusText}`
            );
          }

          const contentDisposition = response.headers.get(
            "Content-Disposition"
          );
          if (contentDisposition?.includes("filename=")) {
            const headerFilename = contentDisposition
              .split("filename=")[1]
              .replace(/"/g, "")
              .trim();
            filename = sanitizeFilename(
              decodeURIComponent(headerFilename),
              item.type
            );
          }

          await triggerDownload(
            `http://127.0.0.1:2025/files/${encodeURIComponent(
              selectedUsbPath
            )}/${encodeURIComponent(filename)}`,
            filename
          );
        } catch (error: any) {
          console.error("HTTP download error:", error);
          if (isMounted) {
            showToast(
              `HTTP download failed for ${item.title}: ${error.message}`,
              "error"
            );
          }
          throw error;
        } finally {
          if (isMounted) {
            setIsDownloading((prev) => prev.filter((id) => id !== item.id));
          }
        }
      }

      return () => {
        isMounted = false;
      };
    },
    [
      selectedUsbPath,
      sessionDownloads,
      isDownloading,
      router,
      purchasedItems,
      setPurchasedItems,
    ]
  );

  return { downloadItem };
};
