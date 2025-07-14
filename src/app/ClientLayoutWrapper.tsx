"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import UserCart from "@/components/CartSideBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Current pathname:", pathname);
  }, [pathname]);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isLoginRoute = pathname === "/";

  // Render only children for login page
  if (isLoginRoute) {
    return <div className="bg-black min-h-screen">{children}</div>;
  }

  // Render minimal layout for admin routes
  if (isAdminRoute) {
    return <div className="bg-black min-h-screen">{children}</div>;
  }

  // Render full layout for other routes (e.g., /home)
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 ml-20">
          {children}
          <UserCart />
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
