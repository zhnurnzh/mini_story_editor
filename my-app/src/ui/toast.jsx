import React, { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider/>");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, variant = "info", id = crypto.randomUUID()) => {
    setToasts((t) => [...t, { id, msg, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  const api = {
    info: (m) => push(m, "info"),
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* toaster UI */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(({ id, msg, variant }) => (
          <div
            key={id}
            className={
              "rounded-lg px-3 py-2 shadow text-sm text-white " +
              (variant === "success"
                ? "bg-emerald-600"
                : variant === "error"
                  ? "bg-rose-600"
                  : "bg-slate-800")
            }
          >
            {msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
