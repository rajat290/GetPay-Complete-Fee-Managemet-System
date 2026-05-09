import React from "react";

/**
 * Skeleton component for modern loading states.
 * @param {string} className - Additional Tailwind classes for sizing/spacing.
 * @param {string} variant - 'text', 'circular', or 'rectangular'.
 */
export default function Skeleton({ className = "", variant = "rectangular" }) {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-800";
  
  const variantClasses = {
    text: "h-3 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}
