import { useEffect, useState } from "react";
import { FiPlay, FiPlus, FiRefreshCw, FiSearch, FiSend } from "react-icons/fi";
import api from "../../services/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const emptyForm = {
  name: "",
  channel: "notification",
  className: "",
  status: "overdue",
  dueBeforeDays: 0,
  isActive: true
};

export default function ReminderCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [campaignRes, classRes] = await Promise.all([
        api.get("/admin/reminder-campaigns"),
        api.get("/admin/classes")
      ]);
      setCampaigns(campaignRes.data || []);
      setClasses(classRes.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load reminder campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createCampaign = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/admin/reminder-campaigns", form);
      setForm(emptyForm);
      setMessage("Reminder campaign saved.");
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not save reminder campaign.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaign = async (campaign) => {
    setMessage("");
    try {
      await api.patch(`/admin/reminder-campaigns/${campaign._id}`, {
        isActive: !campaign.isActive
      });
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update reminder campaign.");
    }
  };

  const runCampaign = async (campaign, dryRun) => {
    setRunningId(campaign._id);
    setMessage("");
    try {
      const res = await api.post(`/admin/reminder-campaigns/${campaign._id}/run`, { dryRun });
      setPreview(res.data);
      setMessage(
        dryRun
          ? `${res.data.summary.matchedCount || 0} recipients matched for ${campaign.name}.`
          : `${res.data.summary.notificationCount || 0} notifications created and ${res.data.summary.emailAttemptCount || 0} emails attempted.`
      );
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not run reminder campaign.");
    } finally {
      setRunningId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Reminder Campaigns</p>
            <h1 className="mt-1 text-2xl font-bold">Reusable due reminder operations</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Save reminder rules for overdue and pending dues, preview recipients, and run campaigns from one place.
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {message && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <form onSubmit={createCampaign} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <FiPlus className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              <h2 className="text-lg font-semibold">New campaign</h2>
            </div>
            <div className="space-y-4">
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Campaign name"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
              />
              <select
                value={form.channel}
                onChange={(event) => setForm({ ...form, channel: event.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="notification">In-app notification</option>
                <option value="email">Email</option>
                <option value="both">Notification and email</option>
              </select>
              <select
                value={form.className}
                onChange={(event) => setForm({ ...form, className: event.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="">All classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                >
                  <option value="overdue">Overdue</option>
                  <option value="pending">Pending</option>
                  <option value="all">All open dues</option>
                </select>
                <input
                  min="0"
                  max="365"
                  type="number"
                  value={form.dueBeforeDays}
                  onChange={(event) => setForm({ ...form, dueBeforeDays: Number(event.target.value) })}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active
              </label>
              <button
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                <FiSend className="h-4 w-4" />
                Save campaign
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-slate-200 p-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Saved campaigns</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{campaigns.length} configured campaigns</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <p className="p-8 text-center text-slate-500">Loading campaigns...</p>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div key={campaign._id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${campaign.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-300"}`}>
                          {campaign.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {campaign.channel} | {campaign.filters?.status || "overdue"} | {campaign.filters?.className || "All classes"} | next {campaign.filters?.dueBeforeDays || 0} days
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Runs: {campaign.runCount || 0}{campaign.lastRunAt ? ` | Last run ${new Date(campaign.lastRunAt).toLocaleString("en-IN")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => runCampaign(campaign, true)}
                        disabled={runningId === campaign._id}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <FiSearch className="h-4 w-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => runCampaign(campaign, false)}
                        disabled={!campaign.isActive || runningId === campaign._id}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                      >
                        <FiPlay className="h-4 w-4" />
                        Run
                      </button>
                      <button
                        onClick={() => toggleCampaign(campaign)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        {campaign.isActive ? "Pause" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-slate-500">No saved campaigns yet.</p>
              )}
            </div>
          </section>
        </div>

        {preview && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Last campaign result</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Matched" value={preview.summary?.matchedCount || 0} />
              <MiniMetric label="Notifications" value={preview.summary?.notificationCount || 0} />
              <MiniMetric label="Emails" value={preview.summary?.emailAttemptCount || 0} />
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {(preview.recipients || []).slice(0, 8).map((recipient) => (
                <div key={recipient.assignmentId} className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-gray-950">
                  <span className="truncate">{recipient.studentName}</span>
                  <span className="font-semibold">{currency.format(recipient.dueAmount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
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
