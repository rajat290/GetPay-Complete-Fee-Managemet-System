import React, { useCallback, useEffect, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  ArrowUpDown
} from "lucide-react";
import Button from "./Button";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import Input from "./Input";

/**
 * Generic DataTable component with server-side pagination and search.
 * @param {Array} columns - Column definitions: { header, accessor, render }.
 * @param {Function} fetchData - Async function to fetch data: (params) => Promise.
 * @param {string} searchPlaceholder - Placeholder for the search input.
 * @param {React.ReactNode} filters - Optional filter components to show next to search.
 */
export default function DataTable({ 
  columns, 
  fetchData, 
  searchPlaceholder = "Search...", 
  filters 
}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, search, limit: 10 };
      const response = await fetchData(params);
      const rows = Array.isArray(response) ? response : response.data || [];
      const nextMeta = response.meta || {
        total: rows.length,
        page,
        limit: 10,
        totalPages: rows.length > 0 ? 1 : 0
      };
      setData(rows);
      setMeta(nextMeta);
    } catch (err) {
      console.error("DataTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      {/* Table Header / Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Input 
            icon={Search}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filters && <div className="flex items-center gap-2 w-full sm:w-auto">{filters}</div>}
      </div>

      {/* Table Body */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && <ArrowUpDown className="w-3 h-3 cursor-pointer hover:text-primary transition-colors" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row, i) => (
                  <tr key={row._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {columns.map((col, j) => (
                      <td key={j} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="text-slate-900 dark:text-white">{(meta.page - 1) * meta.limit + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-slate-900 dark:text-white">{meta.total}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                Page {page} of {meta.totalPages}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(meta.totalPages)}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
