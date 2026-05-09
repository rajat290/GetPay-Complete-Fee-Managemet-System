import React from "react";

/**
 * Standardized Input component.
 * @param {string} label - Optional input label.
 * @param {string} error - Optional error message.
 * @param {React.ReactNode} icon - Optional icon to display inside the input.
 */
export default function Input({ 
  label, 
  error, 
  icon: Icon,
  className = "", 
  containerClassName = "",
  ...props 
}) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          className={`
            block w-full rounded-lg border-slate-200 dark:border-slate-800 
            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-premium text-sm
            ${Icon ? "pl-10" : "pl-3"}
            ${error ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500" : "border-slate-200"}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
