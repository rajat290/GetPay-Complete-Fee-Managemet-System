import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import api from "../../services/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const today = new Date().toISOString().slice(0, 10);

const emptyDues = {
  summary: {
    assignmentCount: 0,
    studentCount: 0,
    totalDueAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    pendingCount: 0,
    overdueCount: 0,
  },
  rows: [],
};

const emptyReconciliation = {
  summary: {
    totalAmount: 0,
    count: 0,
    completedAmount: 0,
    completedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    failedAmount: 0,
    failedCount: 0,
  },
  byMode: {},
  rows: [],
};

export default function FinanceWorkspace() {
  const [dues, setDues] = useState(emptyDues);
  const [reconciliation, setReconciliation] = useState(emptyReconciliation);
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderPreview, setReminderPreview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    className: "",
    status: "all",
    dueBefore: "",
  });
  const [bulkForm, setBulkForm] = useState({
    feeId: "",
    className: "",
    dueDate: today,
  });
  const [reminderForm, setReminderForm] = useState({
    channel: "notification",
    className: "",
    status: "overdue",
    dueBefore: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.className) params.append("className", filters.className);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.dueBefore) params.append("dueBefore", filters.dueBefore);
    return params.toString();
  }, [filters]);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const suffix = queryString ? `?${queryString}` : "";
      const [duesRes, reconciliationRes, classesRes, feesRes, auditRes] = await Promise.all([
        api.get(`/admin/dues${suffix}`),
        api.get("/admin/payments/reconciliation"),
        api.get("/admin/classes"),
        api.get("/fees/"),
        api.get("/admin/audit-logs?limit=5"),
      ]);

      setDues(duesRes.data || emptyDues);
      setReconciliation(reconciliationRes.data || emptyReconciliation);
      setClasses(classesRes.data || []);
      setFees(feesRes.data || []);
      setAuditLogs(auditRes.data?.rows || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load finance workspace.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const refreshOverdue = async () => {
    setRefreshing(true);
    setMessage("");
    try {
      const res = await api.post("/admin/dues/refresh-overdue", { asOfDate: today });
      setMessage(`${res.data.modifiedCount || 0} dues marked overdue.`);
      await loadWorkspace();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not refresh overdue dues.");
    } finally {
      setRefreshing(false);
    }
  };

  const assignBulkFee = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/fees/assign-bulk", bulkForm);
      setMessage(
        `${res.data.createdCount || 0} fee assignments created. ${res.data.skippedCount || 0} duplicates skipped.`
      );
      await loadWorkspace();
    } catch (error) {
      setMessage(error.response?.data?.message || "Bulk fee assignment failed.");
    }
  };

  const runReminderOperation = async (dryRun) => {
    setReminderLoading(true);
    setMessage("");
    try {
      const payload = {
        channel: reminderForm.channel,
        status: reminderForm.status,
        className: reminderForm.className || undefined,
        dueBefore: reminderForm.dueBefore || undefined,
        dryRun,
      };

      const res = await api.post("/admin/dues/reminders", payload);
      setReminderPreview(res.data);
      setMessage(
        dryRun
          ? `${res.data.summary.matchedCount || 0} reminder recipients found.`
          : `${res.data.summary.notificationCount || 0} notifications created and ${res.data.summary.emailAttemptCount || 0} emails attempted.`
      );
      await loadWorkspace();
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "Reminder operation failed.");
    } finally {
      setReminderLoading(false);
    }
  };

  const exportDuesCsv = () => {
    const header = [
      "Student",
      "Registration No",
      "Class",
      "Fee",
      "Assigned Amount",
      "Paid Amount",
      "Due Amount",
      "Due Date",
      "Status",
    ];
    const rows = dues.rows.map((row) => [
      row.student?.name || "",
      row.student?.registrationNo || "",
      row.student?.className || "",
      row.fee?.title || "",
      row.assignedAmount,
      row.paidAmount,
      row.dueAmount,
      new Date(row.dueDate).toLocaleDateString("en-IN"),
      row.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "dues-defaulters-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const modeRows = Object.entries(reconciliation.byMode || {});

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Finance Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold">Institution collection workspace</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Monitor receivables, identify defaulters, assign class-wide dues, and reconcile collection channels from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshOverdue}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
            >
              <FiRefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh overdue
            </button>
            <button
              onClick={exportDuesCsv}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100"
            >
              <FiDownload className="h-4 w-4" />
              Export dues
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<FiTrendingUp className="h-5 w-5" />} label="Total due" value={currency.format(dues.summary.totalDueAmount)} tone="blue" />
          <MetricCard icon={<FiAlertTriangle className="h-5 w-5" />} label="Overdue" value={currency.format(dues.summary.overdueAmount)} tone="red" />
          <MetricCard icon={<FiUsers className="h-5 w-5" />} label="Students with dues" value={dues.summary.studentCount} tone="amber" />
          <MetricCard icon={<FiCheckCircle className="h-5 w-5" />} label="Collected" value={currency.format(reconciliation.summary.completedAmount)} tone="green" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-slate-200 p-4 dark:border-gray-800">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Dues and defaulters</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dues.summary.assignmentCount} open assignments across {dues.summary.studentCount} students
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    value={filters.className}
                    onChange={(event) => setFilters({ ...filters, className: event.target.value })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  >
                    <option value="">All classes</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.status}
                    onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  >
                    <option value="all">All status</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <input
                    type="date"
                    value={filters.dueBefore}
                    onChange={(event) => setFilters({ ...filters, dueBefore: event.target.value })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {dues.rows.length > 0 ? (
                    dues.rows.slice(0, 12).map((row) => (
                      <tr key={row.assignmentId} className="hover:bg-slate-50 dark:hover:bg-gray-800/70">
                        <td className="px-4 py-3">
                          <div className="font-medium">{row.student?.name || "Unknown student"}</div>
                          <div className="text-xs text-slate-500">
                            {row.student?.registrationNo || "-"} | {row.student?.className || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{row.fee?.title || "Fee"}</div>
                          <div className="text-xs text-slate-500">{row.fee?.category || "Other"}</div>
                        </td>
                        <td className="px-4 py-3">{new Date(row.dueDate).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-semibold">{currency.format(row.dueAmount)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                        No open dues for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <FiMail className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                <h2 className="text-lg font-semibold">Due reminders</h2>
              </div>
              <div className="mt-4 space-y-4">
                <select
                  value={reminderForm.channel}
                  onChange={(event) => setReminderForm({ ...reminderForm, channel: event.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="notification">In-app notification</option>
                  <option value="email">Email</option>
                  <option value="both">Notification and email</option>
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={reminderForm.className}
                    onChange={(event) => setReminderForm({ ...reminderForm, className: event.target.value })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  >
                    <option value="">All classes</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reminderForm.status}
                    onChange={(event) => setReminderForm({ ...reminderForm, status: event.target.value })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                  >
                    <option value="overdue">Overdue only</option>
                    <option value="pending">Pending only</option>
                    <option value="all">Pending and overdue</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={reminderForm.dueBefore}
                  onChange={(event) => setReminderForm({ ...reminderForm, dueBefore: event.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => runReminderOperation(true)}
                    disabled={reminderLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-slate-100"
                  >
                    <FiSearch className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => runReminderOperation(false)}
                    disabled={reminderLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    <FiSend className="h-4 w-4" />
                    Send reminders
                  </button>
                </div>
              </div>

              {reminderPreview && (
                <div className="mt-5 rounded-md bg-slate-100 p-3 text-sm dark:bg-gray-950">
                  <div className="grid grid-cols-3 gap-2">
                    <MiniMetric label="Matched" value={reminderPreview.summary.matchedCount} />
                    <MiniMetric label="Notified" value={reminderPreview.summary.notificationCount} />
                    <MiniMetric label="Emails" value={reminderPreview.summary.emailAttemptCount} />
                  </div>
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                    {reminderPreview.recipients.slice(0, 6).map((recipient) => (
                      <div key={recipient.assignmentId} className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-900">
                        <span className="truncate">{recipient.studentName}</span>
                        <span className="font-semibold">{currency.format(recipient.dueAmount)}</span>
                      </div>
                    ))}
                    {reminderPreview.recipients.length === 0 && (
                      <p className="px-3 py-2 text-slate-500">No reminder recipients for the selected filters.</p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold">Bulk fee assignment</h2>
              <form onSubmit={assignBulkFee} className="mt-4 space-y-4">
                <select
                  required
                  value={bulkForm.feeId}
                  onChange={(event) => setBulkForm({ ...bulkForm, feeId: event.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="">Select fee template</option>
                  {fees.map((fee) => (
                    <option key={fee._id} value={fee._id}>
                      {fee.title} - {currency.format(fee.amount)}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={bulkForm.className}
                  onChange={(event) => setBulkForm({ ...bulkForm, className: event.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="">Select class</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="date"
                  value={bulkForm.dueDate}
                  onChange={(event) => setBulkForm({ ...bulkForm, dueDate: event.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  <FiSend className="h-4 w-4" />
                  Assign to class
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <FiSearch className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold">Reconciliation snapshot</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Transactions" value={reconciliation.summary.count} />
                <MiniMetric label="Failed" value={reconciliation.summary.failedCount} />
                <MiniMetric label="Pending" value={currency.format(reconciliation.summary.pendingAmount)} />
                <MiniMetric label="Total" value={currency.format(reconciliation.summary.totalAmount)} />
              </div>
              <div className="mt-4 space-y-3">
                {modeRows.length > 0 ? (
                  modeRows.map(([mode, summary]) => (
                    <div key={mode} className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-gray-950">
                      <span className="capitalize">{mode.replace("_", " ")}</span>
                      <span className="font-semibold">{currency.format(summary.completedAmount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-md bg-slate-100 px-3 py-3 text-sm text-slate-500 dark:bg-gray-950">
                    No payment collections yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <FiShield className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold">Recent audit trail</h2>
              </div>
              <div className="mt-4 space-y-3">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log._id} className="rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-gray-950">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{log.action}</span>
                        <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{log.summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-md bg-slate-100 px-3 py-3 text-sm text-slate-500 dark:bg-gray-950">
                    No recent audit activity.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-md bg-slate-100 p-3 dark:bg-gray-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "overdue"
      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${className}`}>{status}</span>;
}
