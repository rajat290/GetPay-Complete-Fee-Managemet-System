import { useEffect, useState } from "react";
import { FiRefreshCw, FiSave } from "react-icons/fi";
import api from "../../services/api";

const emptyForm = {
  name: "",
  code: "",
  type: "school",
  email: "",
  phone: "",
  plan: "starter",
  subscriptionStatus: "trialing",
  adminName: "",
  adminEmail: "",
  adminPassword: ""
};

export default function SuperAdminInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadInstitutions = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/super-admin/institutions");
      setInstitutions(res.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load institutions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const createInstitution = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/super-admin/institutions", form);
      setForm(emptyForm);
      setMessage("Institution created.");
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not create institution.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (institution, isActive) => {
    setMessage("");
    try {
      await api.patch(`/super-admin/institutions/${institution._id}`, { isActive });
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update institution status.");
    }
  };

  const updateSubscription = async (institution, field, value) => {
    setMessage("");
    try {
      await api.patch(`/super-admin/institutions/${institution._id}/subscription`, {
        [field]: value
      });
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update subscription.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Organizations</p>
          <h1 className="mt-1 text-2xl font-bold">Institution Control</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Create institutions, assign plans, and suspend or reactivate access.
          </p>
        </div>
        <button
          onClick={loadInstitutions}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={createInstitution} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold">Create institution</h2>
          <div className="mt-4 space-y-3">
            <input required placeholder="Institution name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <input required placeholder="Institution code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="coaching">Coaching</option>
                <option value="other">Other</option>
              </select>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <input type="email" placeholder="Institution email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <input placeholder="Institution phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <div className="border-t border-slate-200 pt-3 dark:border-gray-800">
              <input required placeholder="Admin name" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
              <input required type="email" placeholder="Admin email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
              <input required type="password" placeholder="Temporary admin password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            </div>
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
              <FiSave className="h-4 w-4" />
              Create
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-slate-200 p-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Institutions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{institutions.length} total organizations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading institutions...</td></tr>
                ) : institutions.map((institution) => (
                  <tr key={institution._id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{institution.name}</div>
                      <div className="text-xs text-slate-500">{institution.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{institution.subscriptionSummary?.usage?.students || 0} students</div>
                      <div className="text-xs text-slate-500">{institution.adminCount || 0} admins</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={institution.subscription?.plan || "starter"}
                        onChange={(e) => updateSubscription(institution, "plan", e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
                      >
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={institution.subscription?.status || "trialing"}
                        onChange={(e) => updateSubscription(institution, "status", e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950"
                      >
                        <option value="trialing">Trialing</option>
                        <option value="active">Active</option>
                        <option value="past_due">Past due</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateStatus(institution, !institution.isActive)}
                        className={`rounded-md px-3 py-2 text-sm font-semibold ${
                          institution.isActive
                            ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
                        }`}
                      >
                        {institution.isActive ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
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
