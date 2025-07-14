"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Modal from "./Modal";

interface EndUserCreate {
  username?: string | null;
  password?: string | null;
  phonenumber?: string | null;
  balance?: number | null;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EndUserCreate) => Promise<void>;
  token: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  token,
}) => {
  const [isVoucherOnly, setIsVoucherOnly] = useState(false);
  const [formData, setFormData] = useState<EndUserCreate>({
    username: "",
    password: "",
    phonenumber: "",
    balance: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "balance" ? (value === "" ? null : Number(value)) : value,
      }));
      setError(null);
    },
    []
  );

  const handleToggleMode = useCallback(() => {
    setIsVoucherOnly((prev) => !prev);
    setFormData({
      username: "",
      password: "",
      phonenumber: "",
      balance: null,
    });
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (isVoucherOnly) {
        if (!formData.balance || formData.balance <= 0) {
          setError("Voucher-only creation requires a balance greater than 0");
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!formData.username?.trim()) {
          setError("Username is required for normal signup");
          setIsSubmitting(false);
          return;
        }
        if (!formData.password?.trim()) {
          setError("Password is required for normal signup");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare payload
      const payload: EndUserCreate = {
        username: isVoucherOnly ? null : formData.username,
        password: isVoucherOnly ? null : formData.password,
        phonenumber: formData.phonenumber?.trim() || null,
        balance: formData.balance || null,
      };

      try {
        await onSubmit(payload);
        setFormData({
          username: "",
          password: "",
          phonenumber: "",
          balance: null,
        });
        setIsVoucherOnly(false);
        onClose();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create user";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isVoucherOnly, onSubmit, onClose]
  );

  return (
    <Modal
      title="Add New End User"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700/20 backdrop-blur-md text-white rounded-lg hover:bg-gray-600 transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 p-3 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Signup Mode
          </label>
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isVoucherOnly}
                onChange={handleToggleMode}
                className="form-checkbox bg-gray-700/20 backdrop-blur-md border-gray-600 text-purple-400 focus:ring-purple-400"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-white">Voucher-Only Signup</span>
            </label>
          </div>
        </div>
        {!isVoucherOnly && (
          <>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-700/20 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
                placeholder="Enter username"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-700/20 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
                placeholder="Enter password"
                disabled={isSubmitting}
              />
            </div>
          </>
        )}
        <div>
          <label
            htmlFor="phonenumber"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            name="phonenumber"
            id="phonenumber"
            value={formData.phonenumber || ""}
            onChange={handleChange}
            className="mt-1 w-full bg-gray-700/20 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
            placeholder="Enter phone number"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label
            htmlFor="balance"
            className="block text-sm font-medium text-gray-300"
          >
            Initial Balance {isVoucherOnly ? "(Required)" : "(Optional)"}
          </label>
          <input
            type="number"
            name="balance"
            id="balance"
            value={formData.balance ?? ""}
            onChange={handleChange}
            className="mt-1 w-full bg-gray-700/20 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-400"
            placeholder="Enter initial balance"
            disabled={isSubmitting}
            step="0.01"
            min={isVoucherOnly ? "0.01" : "0"}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
