"use client";

import React from "react";
import { motion } from "framer-motion";
import { ContentResponse } from "../api/types";

export interface Column {
  header: string;
  accessor: string | ((item: any) => React.ReactNode);
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column[];
  type: string;
  onDelete: (id: string, type: string) => void;
  onEdit: (data: T) => void;
  onPreview: (data: T) => void;
}

const GenericTable = <T extends ContentResponse>({
  data,
  columns,
  type,
  onDelete,
  onEdit,
  onPreview,
}: GenericTableProps<T>) => {
  // Helper to safely render cell content
  const renderCellContent = (item: T, accessor: Column["accessor"]) => {
    let value =
      typeof accessor === "function"
        ? accessor(item)
        : item[accessor as keyof T];

    if (value === null || value === undefined) {
      return "—"; // fallback for null/undefined
    }

    // If React element, render directly
    if (React.isValidElement(value)) {
      return value;
    }

    // Primitive types
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    // For objects or arrays, return pretty JSON (formatted string)
    try {
      return (
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } catch {
      return "Invalid Data";
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor.toString()}
                className="py-3 px-4 text-left"
              >
                {column.header}
              </th>
            ))}
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-800 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={`${item.id}-${column.accessor.toString()}`}
                  className="py-3 px-4"
                >
                  {renderCellContent(item, column.accessor)}
                </td>
              ))}
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end space-x-2">
                  {/* <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 transition-colors"
                    onClick={() => onPreview(item)}
                    aria-label="Preview"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </motion.button> */}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-purple-600 transition-colors"
                    onClick={() => onEdit(item)}
                    aria-label="Edit"
                  >
                    {/* Edit icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 transition-colors"
                    onClick={() => onDelete(item.id.toString(), type)}
                    aria-label="Delete"
                  >
                    {/* Delete icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
