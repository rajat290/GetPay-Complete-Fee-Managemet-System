import { useCallback, useEffect, useMemo, useState } from "react";
import { FiFilter, FiRefreshCw, FiSearch, FiShield } from "react-icons/fi";
import api from "../../services/api";

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
  const [message, setMessage] = useState("");
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
    setMessage("");
    try {
      const res = await api.get(`/admin/audit-logs?${query}`);
      setLogs(res.data.rows || []);
      setSummary({
        total: res.data.total || 0,
        page: res.data.page || 1,
        totalPages: res.data.totalPages || 1
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load audit trail.");
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              <FiShield className="h-4 w-4" />
              Audit Trail
            </p>
            <h1 className="mt-1 text-2xl font-bold">Institution activity log</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Review admin actions, actor identity, timestamps, and operational metadata.
            </p>
          </div>
          <button
            onClick={loadLogs}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Filters</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={filters.action}
              onChange={(event) => updateFilter("action", event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="">All actions</option>
              {actionOptions.filter(Boolean).map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <select
              value={filters.entityType}
              onChange={(event) => updateFilter("entityType", event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="">All entities</option>
              {entityOptions.filter(Boolean).map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter("startDate", event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter("endDate", event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
          </div>
        </section>

        {message && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            {message}
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold">Activity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{summary.total} matching records</p>
            </div>
            <FiSearch className="h-5 w-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading audit trail...</td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-gray-800/70">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-semibold">{log.action}</td>
                      <td className="px-4 py-3">
                        <div>{log.actor?.name || "System"}</div>
                        <div className="text-xs text-slate-500">{log.actor?.email || log.actorRole}</div>
                      </td>
                      <td className="px-4 py-3">{log.entityType}</td>
                      <td className="min-w-[260px] px-4 py-3 text-slate-600 dark:text-slate-300">{log.summary}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-10 text-center text-slate-500">No audit records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-gray-800">
            <span className="text-slate-500">Page {summary.page} of {summary.totalPages || 1}</span>
            <div className="flex gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-md border border-slate-300 px-3 py-1 font-medium disabled:opacity-50 dark:border-gray-700"
              >
                Previous
              </button>
              <button
                disabled={filters.page >= summary.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-md border border-slate-300 px-3 py-1 font-medium disabled:opacity-50 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
