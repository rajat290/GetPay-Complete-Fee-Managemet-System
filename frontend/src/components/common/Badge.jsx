import React from "react";

/**
 * Status Badge component.
 * @param {string} variant - 'success', 'warning', 'error', 'info', 'neutral'.
 */
export default function Badge({ children, variant = "neutral", className = "" }) {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold";
  
  const variants = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
    error: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
