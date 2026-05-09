import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  RefreshCw, 
  Plus, 
  Building2, 
  CreditCard, 
  Settings2, 
  ChevronRight,
  ShieldCheck,
  PauseCircle,
  FileText,
  User,
  Mail,
  Phone,
  Zap,
  Save,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      setMessage("Institution created successfully.");
      setShowCreateModal(false);
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
      setMessage(`Institution ${isActive ? 'reactivated' : 'suspended'}.`);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update status.");
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
    try {
      await api.post(`/super-admin/institutions/${selectedInstitution._id}/invoices`, invoiceForm);
      setInvoiceForm(emptyInvoiceForm);
      setMessage("Invoice issued.");
      await loadInvoices(selectedInstitution);
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not create invoice.");
    }
  };

  const markInvoicePaid = async (invoice) => {
    if (!selectedInstitution) return;
    try {
      await api.patch(`/super-admin/institutions/${selectedInstitution._id}/invoices/${invoice._id}/paid`);
      setMessage("Invoice marked paid.");
      await loadInvoices(selectedInstitution);
      await loadInstitutions();
    } catch (error) {
      setMessage(error.response?.data?.error || "Action failed.");
    }
  };

  return (
    <div className="px-8 space-y-12">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-reveal">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            <Building2 className="h-4 w-4" />
            Tenancy Operations
          </p>
          <h1 className="font-display text-4xl font-black text-surface-900 dark:text-white tracking-tight">
            Institution <span className="text-primary italic">Control.</span>
          </h1>
          <p className="mt-4 text-lg text-surface-900/60 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
            Manage multi-tenant lifecycles, billing schedules, and custom module access.
          </p>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white text-sm font-black shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark">
            <Plus className="h-5 w-5" strokeWidth={3} />
            Onboard Institution
          </button>
          <button onClick={loadInstitutions} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 transition-all hover:bg-surface-50">
            <RefreshCw className={`h-5 w-5 text-surface-900/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-bold text-primary flex items-center gap-3 backdrop-blur-md">
          <Zap className="h-5 w-5" />
          {message}
        </div>
      )}

      {/* Institution Table */}
      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-100 text-sm dark:divide-slate-800">
            <thead className="bg-surface-50 dark:bg-slate-900">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Institution Entity</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Usage Depth</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Commercial Tier</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Status</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-surface-900/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white/40 dark:divide-slate-800 dark:bg-slate-900/40">
              {loading && institutions.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-surface-900/30 font-bold">Synchronizing Global Tenants...</td></tr>
              ) : institutions.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-surface-900/30 font-bold">No Active Institutions Recorded.</td></tr>
              ) : institutions.map((inst) => (
                <tr key={inst._id} className="hover:bg-white/60 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-surface-100 dark:bg-slate-800 flex items-center justify-center text-surface-900/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-display text-base font-black tracking-tight">{inst.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/30 dark:text-slate-500">{inst.code} • {inst.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <p className="font-bold text-xs">{inst.subscriptionSummary?.usage?.students || 0} / {inst.subscriptionSummary?.limits?.students || "∞"} Students</p>
                      <div className="w-32 h-1.5 bg-surface-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((inst.subscriptionSummary?.usage?.students || 0) / (inst.subscriptionSummary?.limits?.students || 100) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${inst.subscription?.plan === 'enterprise' ? 'bg-indigo-500 text-white' : inst.subscription?.plan === 'growth' ? 'bg-primary text-white' : 'bg-surface-100 text-surface-900/60 dark:bg-slate-800 dark:text-slate-300'}`}>
                      <Zap size={10} strokeWidth={3} />
                      {inst.subscription?.plan}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${inst.isActive ? 'text-primary' : 'text-rose-500'}`}>
                        {inst.isActive ? 'Active Lifecycle' : 'Access Restricted'}
                      </span>
                      <p className="text-[10px] font-bold text-surface-900/30 uppercase">{inst.subscription?.status}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => loadInvoices(inst)} className="p-3 rounded-xl bg-surface-50 text-surface-900/40 hover:bg-primary/10 hover:text-primary transition-all dark:bg-slate-800">
                        <CreditCard size={16} />
                      </button>
                      <Link to={`/super-admin/institutions/${inst._id}`} className="p-3 rounded-xl bg-surface-900 text-white hover:bg-black transition-all dark:bg-white dark:text-slate-900">
                        <Settings2 size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-card !p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-black tracking-tight">New Tenant Onboarding</h2>
                  <p className="text-sm text-surface-900/40 font-medium">Provision a new institutional environment instantly.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-surface-100">
                  <Trash2 size={20} className="text-surface-900/20" />
                </button>
              </div>

              <form onSubmit={createInstitution} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormInput label="Institution Name" required value={form.name} onChange={(val) => setForm({...form, name: val})} placeholder="St. Mary's Academy" />
                  <FormInput label="Identifier Code" required value={form.code} onChange={(val) => setForm({...form, code: val.toUpperCase()})} placeholder="SMA-001" />
                  
                  <FormInput label="Organization Type" type="select" value={form.type} onChange={(val) => setForm({...form, type: val})} 
                    options={[["school", "School"], ["college", "College"], ["coaching", "Coaching Hub"], ["other", "Others"]]} 
                  />
                  <FormInput label="Initial Tier" type="select" value={form.plan} onChange={(val) => setForm({...form, plan: val})} 
                    options={[["starter", "Starter"], ["growth", "Growth"], ["enterprise", "Enterprise"]]} 
                  />

                  <FormInput label="Contact Email" type="email" value={form.email} onChange={(val) => setForm({...form, email: val})} />
                  <FormInput label="Contact Phone" value={form.phone} onChange={(val) => setForm({...form, phone: val})} />
                </div>

                <div className="pt-6 border-t border-surface-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Master Admin Credentials</p>
                  <div className="grid gap-6 md:grid-cols-3">
                    <FormInput label="Admin Name" required value={form.adminName} onChange={(val) => setForm({...form, adminName: val})} />
                    <FormInput label="Admin Email" required type="email" value={form.adminEmail} onChange={(val) => setForm({...form, adminEmail: val})} />
                    <FormInput label="Initial Password" required type="password" value={form.adminPassword} onChange={(val) => setForm({...form, adminPassword: val})} />
                  </div>
                </div>

                <button disabled={saving} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-sm font-black text-white shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50">
                  {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" strokeWidth={3} />}
                  Onboard & Provision Environment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Billing Slide-over (simplified for aesthetic) */}
      <AnimatePresence>
        {selectedInstitution && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInstitution(null)} className="absolute inset-0 bg-surface-900/40 backdrop-blur-xs" />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-display text-2xl font-black tracking-tight">Billing Queue</h2>
                <button onClick={() => setSelectedInstitution(null)} className="rounded-full bg-surface-100 p-2"><Plus className="rotate-45" /></button>
              </div>

              <div className="mb-10 p-6 rounded-3xl bg-surface-50 dark:bg-slate-800/50 border border-surface-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40">Active Subject</p>
                <p className="text-xl font-black mt-1">{selectedInstitution.name}</p>
                <p className="text-xs font-bold text-primary mt-1 uppercase">{selectedInstitution.subscription?.plan} • {selectedInstitution.subscription?.status}</p>
              </div>

              <form onSubmit={createInvoice} className="space-y-6 mb-12">
                <FormInput label="Invoice Amount (INR)" type="number" required value={invoiceForm.amountInr} onChange={(val) => setInvoiceForm({...invoiceForm, amountInr: val})} />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Period Start" type="date" required value={invoiceForm.billingPeriodStart} onChange={(val) => setInvoiceForm({...invoiceForm, billingPeriodStart: val})} />
                  <FormInput label="Period End" type="date" required value={invoiceForm.billingPeriodEnd} onChange={(val) => setInvoiceForm({...invoiceForm, billingPeriodEnd: val})} />
                </div>
                <FormInput label="Payment Due Date" type="date" required value={invoiceForm.dueDate} onChange={(val) => setInvoiceForm({...invoiceForm, dueDate: val})} />
                <FormInput label="Operational Notes" value={invoiceForm.notes} onChange={(val) => setInvoiceForm({...invoiceForm, notes: val})} />
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-900 py-4 text-sm font-black text-white hover:bg-black transition-all dark:bg-white dark:text-slate-900">
                  Issue Manual Invoice
                </button>
              </form>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40">Ledger History</p>
                {invoices.length === 0 ? (
                  <p className="text-sm font-bold text-surface-900/20 text-center py-10">No Invoice History Found.</p>
                ) : invoices.map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between p-4 rounded-2xl border border-surface-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-sm tracking-tight">{inv.invoiceNumber}</p>
                      <p className="text-[10px] font-bold text-surface-900/40 uppercase">₹{Number(inv.amountInr).toLocaleString()} • {inv.status}</p>
                    </div>
                    {inv.status !== 'paid' && (
                      <button onClick={() => markInvoicePaid(inv)} className="rounded-xl bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                        Mark Paid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", options, placeholder, required }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-surface-900/40 dark:text-slate-500">{label}</span>
      {type === "select" ? (
        <select 
          required={required}
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 transition-all outline-none"
        >
          {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      ) : (
        <input 
          required={required}
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 transition-all outline-none placeholder:opacity-30" 
        />
      )}
    </label>
  );
}
