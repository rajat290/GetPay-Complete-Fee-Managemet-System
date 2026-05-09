import React from "react";
import { Inbox } from "lucide-react";

/**
 * Branded EmptyState component with premium micro-interactions.
 * @param {React.ReactNode} icon - Optional Lucide icon.
 * @param {string} title - Title of the empty state.
 * @param {string} description - Detailed description.
 * @param {React.ReactNode} action - Optional CTA button.
 */
export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No data found", 
  description = "There are no records matching your current criteria or selection.", 
  action,
  className = ""
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700 ${className}`}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-20 h-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none">
          <Icon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase tracking-widest text-xs opacity-80">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="animate-in slide-in-from-top-2 duration-1000">
          {action}
        </div>
      )}
    </div>
  );
}
