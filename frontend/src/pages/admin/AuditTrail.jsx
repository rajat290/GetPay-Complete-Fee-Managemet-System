import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Shield, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import Input from "../../components/common/Input";

const actionOptions = [
  "",
  "student.created",
  "student.invited",
  "fee.bulk_assigned",
  "payment.offline_recorded",
  "dues.reminders_sent",
  "reminder_campaign.ran",
  "institution.settings_updated"
];

const entityOptions = ["", "Student", "Fee", "FeeAssignment", "Payment", "Notification", "ReminderCampaign", "Institution"];

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
    page: 1
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.entityType) params.append("entityType", filters.entityType);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    params.append("page", String(filters.page));
    params.append("limit", "25");
    return params.toString();
  }, [filters]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.get(`/admin/audit-logs?${query}`);
      setLogs(res.data.rows || []);
      setSummary({
        total: res.data.total || 0,
        page: res.data.page || 1,
        totalPages: res.data.totalPages || 1
      });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Could not load audit trail." });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  };

  if (loading && filters.page === 1) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Card noPadding>
          <div className="p-4 space-y-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Audit</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Immutable record of all administrative operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadLogs} isLoading={loading}>
            Refresh Logs
          </Button>
          <Badge variant="neutral" className="py-1.5 px-3">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Compliance Mode
          </Badge>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          message.type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters Card */}
      <Card title="Activity Filters" icon={Filter}>
        <div className="grid gap-4 md:grid-cols-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</label>
            <select
              value={filters.action}
              onChange={(event) => updateFilter("action", event.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-premium appearance-none"
            >
              <option value="">All Actions</option>
              {actionOptions.filter(Boolean).map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</label>
            <select
              value={filters.entityType}
              onChange={(event) => updateFilter("entityType", event.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-premium appearance-none"
            >
              <option value="">All Entities</option>
              {entityOptions.filter(Boolean).map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter("startDate", event.target.value)}
              className="h-10 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter("endDate", event.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>
      </Card>

      <Card 
        title="Activity Stream" 
        subtitle={`${summary.total} immutable events captured`}
        noPadding
        action={<Fingerprint className="w-4 h-4 text-slate-300" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{new Date(log.createdAt).toLocaleString("en-IN", { 
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                        })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-primary uppercase">
                        {log.action}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{log.actor?.name || "System"}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{log.actorRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral" className="px-1.5 py-0 text-[10px]">{log.entityType}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium min-w-[200px] leading-relaxed">
                        {log.summary}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Activity className="w-12 h-12 mb-2" />
                      <p className="text-sm font-bold">No activity logs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Page {summary.page} <span className="mx-1 text-slate-200">/</span> {summary.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              icon={ChevronLeft}
              disabled={filters.page <= 1}
              onClick={() => setFilters(curr => ({ ...curr, page: curr.page - 1 }))}
            />
            <Button 
              variant="secondary" 
              size="sm" 
              icon={ChevronRight}
              disabled={filters.page >= summary.totalPages}
              onClick={() => setFilters(curr => ({ ...curr, page: curr.page + 1 }))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
