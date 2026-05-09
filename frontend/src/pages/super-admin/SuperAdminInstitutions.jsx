import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const emptyInvoiceForm = {
  amountInr: "",
  billingPeriodStart: "",
  billingPeriodEnd: "",
  dueDate: "",
  notes: ""
};

export default function SuperAdminInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm);

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
    const loadModules = async () => {
      try {
        const res = await api.get("/super-admin/modules");
        setModules(res.data.modules || []);
      } catch {
        setModules([]);
      }
    };

    loadModules();
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

  const toggleModule = async (institution, moduleKey) => {
    const current = institution.enabledModules || [];
    const next = current.includes(moduleKey)
      ? current.filter((key) => key !== moduleKey)
      : [...current, moduleKey];

    setMessage("");
    try {
      await api.patch(`/super-admin/institutions/${institution._id}/modules`, {
        enabledModules: next
      });
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update module access.");
    }
  };

  const loadInvoices = async (institution) => {
    setSelectedInstitution(institution);
    setInvoiceForm(emptyInvoiceForm);
    setMessage("");
    try {
      const res = await api.get(`/super-admin/institutions/${institution._id}/invoices`);
      setInvoices(res.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load invoices.");
    }
  };

  const createInvoice = async (event) => {
    event.preventDefault();
    if (!selectedInstitution) return;

    setMessage("");
    try {
      await api.post(`/super-admin/institutions/${selectedInstitution._id}/invoices`, invoiceForm);
      setInvoiceForm(emptyInvoiceForm);
      setMessage("Invoice created.");
      await loadInvoices(selectedInstitution);
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not create invoice.");
    }
  };

  const markInvoicePaid = async (invoice) => {
    if (!selectedInstitution) return;

    setMessage("");
    try {
      await api.patch(`/super-admin/institutions/${selectedInstitution._id}/invoices/${invoice._id}/paid`);
      setMessage("Invoice marked paid.");
      await loadInvoices(selectedInstitution);
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update invoice.");
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
                  <th className="px-4 py-3">Modules</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading institutions...</td></tr>
                ) : institutions.map((institution) => (
                  <tr key={institution._id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{institution.name}</div>
                      <div className="text-xs text-slate-500">{institution.code}</div>
                      <Link to={`/super-admin/institutions/${institution._id}`} className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline">
                        Open control center
                      </Link>
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
                    <td className="min-w-[260px] px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {modules.map((module) => {
                          const enabled = (institution.enabledModules || []).includes(module.key);
                          return (
                            <button
                              key={module.key}
                              type="button"
                              onClick={() => toggleModule(institution, module.key)}
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                enabled
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300"
                              }`}
                              title={module.description}
                            >
                              {module.name}
                            </button>
                          );
                        })}
                      </div>
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
                    <td className="px-4 py-3">
                      <button
                        onClick={() => loadInvoices(institution)}
                        className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200"
                      >
                        Invoices
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedInstitution && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Billing for {selectedInstitution.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manual invoices for early paid pilots.</p>
            </div>
            <button
              onClick={() => setSelectedInstitution(null)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>

          <form onSubmit={createInvoice} className="mb-5 grid gap-3 md:grid-cols-5">
            <input required type="number" min="0" placeholder="Amount INR" value={invoiceForm.amountInr} onChange={(e) => setInvoiceForm({ ...invoiceForm, amountInr: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <input required type="date" value={invoiceForm.billingPeriodStart} onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodStart: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <input required type="date" value={invoiceForm.billingPeriodEnd} onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodEnd: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <input required type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
            <button className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Create Invoice</button>
            <input placeholder="Notes" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 md:col-span-5" />
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
              <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {invoices.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No invoices yet.</td></tr>
                ) : invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-4 py-3 font-semibold">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">₹{Number(invoice.amountInr || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{invoice.dueDate?.slice(0, 10)}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3">
                      {invoice.status !== "paid" && invoice.status !== "void" && (
                        <button
                          onClick={() => markInvoicePaid(invoice)}
                          className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
