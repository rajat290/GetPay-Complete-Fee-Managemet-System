import React from "react";

/**
 * Premium Card component.
 * @param {string} title - Optional card title.
 * @param {string} subtitle - Optional card subtitle.
 * @param {React.ReactNode} action - Optional action (e.g., button) in the header.
 */
export default function Card({ 
  children, 
  title, 
  subtitle, 
  action, 
  className = "",
  noPadding = false 
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}
