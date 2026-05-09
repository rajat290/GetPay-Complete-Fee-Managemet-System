import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiActivity, 
  FiSearch, 
  FiFilter, 
  FiArrowRight, 
  FiClock, 
  FiUser, 
  FiDatabase,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import axios from "axios";
import { format } from "date-fns";

export default function SuperAdminAudits() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    limit: 15
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/super-admin/audits", {
        params: { ...filters, page },
        withCredentials: true
      });
      setLogs(data.rows);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching platform audits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const getActionColor = (action) => {
    if (action.includes("created")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("updated")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (action.includes("deleted") || action.includes("archived")) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (action.includes("impersonation")) return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    return "text-slate-500 bg-slate-500/10 border-slate-500/20";
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8 font-['Lexend'] text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-['Syne'] text-3xl font-bold tracking-tight">Platform Telemetry</h1>
            <p className="mt-1 text-slate-400">Global audit trail and administrative oversight</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
              <input 
                type="text" 
                placeholder="Search actions..."
                className="w-64 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/10">
              <FiFilter className="text-emerald-500" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Events", value: "2.4k", icon: FiActivity, color: "emerald" },
            { label: "Critical Actions", value: "48", icon: FiAlertCircle, color: "rose" },
            { label: "Support Logins", value: "12", icon: FiUser, color: "purple" }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-${stat.color}-500/10 blur-2xl`} />
            </motion.div>
          ))}
        </div>

        {/* Log List */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          <p className="text-sm text-slate-500">Retrieving platform telemetry...</p>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <FiDatabase className="mx-auto h-12 w-12 text-slate-700" />
                        <p className="mt-4 text-slate-500">No activity logs found</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, i) => (
                      <motion.tr
                        key={log._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${getActionColor(log.action)}`}>
                              {log.action.split('.').pop()?.replace('_', ' ')}
                            </span>
                            <span className="mt-2 text-sm font-medium text-white">{log.summary}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs uppercase">
                              {log.actorId?.name?.slice(0, 2) || "SA"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{log.actorId?.name || "System"}</span>
                              <span className="text-xs text-slate-500">{log.actorId?.email || "automated-process"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-300">{log.entityType}</span>
                            <span className="mt-1 font-mono text-[10px] text-slate-500">{log.entityId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                              <FiClock className="h-3 w-3 text-emerald-500" />
                              {format(new Date(log.createdAt), "HH:mm:ss")}
                            </div>
                            <span className="mt-1 text-xs text-slate-500">
                              {format(new Date(log.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium text-white">{logs.length}</span> of <span className="font-medium text-white">{totalPages * (filters.limit)}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-emerald-500/10 px-2 text-xs font-bold text-emerald-500">
                {page}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
