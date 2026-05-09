import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Premium Button component.
 * @param {string} variant - 'primary', 'secondary', 'danger', 'ghost', 'outline'.
 * @param {string} size - 'sm', 'md', 'lg'.
 * @param {boolean} isLoading - Shows a spinner and disables the button.
 * @param {React.ReactNode} icon - Optional icon to display before text.
 */
export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  fullWidth = false,
  icon: Icon,
  className = "",
  disabled = false,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-premium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 shadow-sm",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 shadow-xs",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/50 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5 dark:border-primary dark:text-primary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
