"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warn";
  onDismiss: () => void;
  timeout?: number;
}

export default function Toast({
  message,
  type = "success",
  onDismiss,
  timeout = 2500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, timeout);
    return () => clearTimeout(timer);
  }, [onDismiss, timeout]);

  const borderColor = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warn: "border-l-amber-500",
  }[type];

  return (
    <div
      className={`min-w-[220px] max-w-[360px] bg-[rgba(16,20,30,0.95)] border border-white/15 rounded-xl shadow-lg text-white px-3 py-2.5 border-l-4 ${borderColor} animate-[fadeUp_220ms_ease]`}
    >
      {message}
    </div>
  );
}
