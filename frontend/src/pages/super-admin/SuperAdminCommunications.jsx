import { useEffect, useState } from "react";
import { FiRefreshCw, FiSend } from "react-icons/fi";
import api from "../../services/api";

const emptyForm = {
  title: "",
  message: "",
  audience: "all",
  channel: "in_app",
  status: "draft",
  scheduledAt: ""
};

export default function SuperAdminCommunications() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/super-admin/announcements");
      setAnnouncements(res.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const createAnnouncement = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/super-admin/announcements", {
        ...form,
        scheduledAt: form.scheduledAt || undefined
      });
      setForm(emptyForm);
      setMessage("Announcement created.");
      await loadAnnouncements();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not create announcement.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Communication control</p>
          <h1 className="mt-1 text-2xl font-bold">Announcements & Notices</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Create platform notices for all institutions or prepare targeted institution messages for the next delivery layer.
          </p>
        </div>
        <button onClick={loadAnnouncements} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={createAnnouncement} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">Create announcement</h2>
          <div className="mt-4 space-y-3">
            <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Message
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="5" required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <Select label="Audience" value={form.audience} onChange={(value) => setForm({ ...form, audience: value })} options={[
                ["all", "All institutions"],
                ["institution", "Specific institution"]
              ]} />
              <Select label="Channel" value={form.channel} onChange={(value) => setForm({ ...form, channel: value })} options={[
                ["in_app", "In app"],
                ["email", "Email"],
                ["notice", "Notice"]
              ]} />
              <Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={[
                ["draft", "Draft"],
                ["scheduled", "Scheduled"],
                ["sent", "Sent"]
              ]} />
              <Input label="Schedule at" type="datetime-local" value={form.scheduledAt} onChange={(value) => setForm({ ...form, scheduledAt: value })} />
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              <FiSend className="h-4 w-4" />
              Create
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-slate-200 p-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Announcement history</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{announcements.length} records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950">
                <tr>
                  <th className="px-4 py-3">Announcement</th>
                  <th className="px-4 py-3">Audience</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading announcements...</td></tr>
                ) : announcements.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No announcements yet.</td></tr>
                ) : announcements.map((announcement) => (
                  <tr key={announcement._id}>
                    <td className="max-w-xl px-4 py-3">
                      <div className="font-semibold">{announcement.title}</div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{announcement.message}</p>
                    </td>
                    <td className="px-4 py-3">{announcement.audience}</td>
                    <td className="px-4 py-3">{announcement.channel}</td>
                    <td className="px-4 py-3">{announcement.status}</td>
                    <td className="px-4 py-3">{announcement.createdAt?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}
