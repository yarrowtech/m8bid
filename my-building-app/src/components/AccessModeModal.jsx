import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function AccessModeModal({
  open,
  onClose,
  onLogin,
  title,
  message,
  buttonLabel = "Go to Login",
}) {
  if (!open) return null;

  return createPortal(
    <div className="app-popup-backdrop fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
      <div className="app-popup-panel w-full max-w-lg rounded-[32px] border border-slate-200/80 bg-white/98 p-8 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.4)] backdrop-blur-md">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Secure Access Required
            </p>
            <h3 className="mt-3 text-3xl font-bold leading-tight text-slate-950">
              {title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
            aria-label="Close notification"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-6 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:brightness-110 hover:shadow-2xl"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
