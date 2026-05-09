import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  RefreshCw, 
  Save, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Zap, 
  CreditCard, 
  Archive, 
  RotateCcw,
  UserCheck,
  Eye,
  Settings2,
  Calendar,
  Layers,
  BarChart3
} from "lucide-react";
import { AuthContext } from "../../context/authContextValue";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const blankLimitOverrides = {
  students: "",
  admins: "",
  reminderCampaigns: ""
};

export default function SuperAdminInstitutionDetail() {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const { startImpersonation } = useContext(AuthContext);
  const [institution, setInstitution] = useState(null);
  const [modules, setModules] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [recoveryLogs, setRecoveryLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [riskReason, setRiskReason] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [trialDays, setTrialDays] = useState(7);
  const [convertPlan, setConvertPlan] = useState("growth");
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: "starter",
    status: "trialing",
    currentPeriodEndsAt: ""
  });
  const [limitOverrides, setLimitOverrides] = useState(blankLimitOverrides);
  const [recoveryReason, setRecoveryReason] = useState("");
  const [impersonationReason, setImpersonationReason] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [institutionRes, adminsRes, logsRes] = await Promise.all([
        api.get(`/super-admin/institutions/${institutionId}`),
        api.get(`/super-admin/institutions/${institutionId}/admins`),
        api.get(`/super-admin/institutions/${institutionId}/admin-recovery-logs`)
      ]);
      const data = institutionRes.data;
      setInstitution(data);
      setAdmins(adminsRes.data || []);
      setRecoveryLogs(logsRes.data || []);
      setRiskReason(data.riskControls?.reason || "");
      setSubscriptionForm({
        plan: data.subscription?.plan || "starter",
        status: data.subscription?.status || "trialing",
        currentPeriodEndsAt: data.subscription?.currentPeriodEndsAt?.slice(0, 10) || ""
      });
      setLimitOverrides({
        students: data.subscription?.limitOverrides?.students ?? "",
        admins: data.subscription?.limitOverrides?.admins ?? "",
        reminderCampaigns: data.subscription?.limitOverrides?.reminderCampaigns ?? ""
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load institution control page.");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

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
    load();
  }, [load]);

  const patchInstitution = async (path, body, success) => {
    setMessage("");
    setTemporaryPassword("");
    try {
      const res = await api.patch(`/super-admin/institutions/${institutionId}${path}`, body);
      setInstitution(res.data);
      setMessage(success);
      return res.data;
    } catch (error) {
      setMessage(error.response?.data?.error || "Action failed.");
      return null;
    }
  };

  const saveLimitOverrides = async () => {
    await patchInstitution("/subscription", { limitOverrides }, "Limit overrides saved.");
  };

  const saveSubscription = async () => {
    await patchInstitution("/subscription", {
      ...subscriptionForm,
      currentPeriodEndsAt: subscriptionForm.currentPeriodEndsAt || undefined
    }, "Subscription updated.");
  };

  const toggleModule = async (moduleKey) => {
    const current = institution?.enabledModules || [];
    const next = current.includes(moduleKey)
      ? current.filter((key) => key !== moduleKey)
      : [...current, moduleKey];

    await patchInstitution("/modules", { enabledModules: next }, "Module access updated.");
  };

  const toggleRisk = async (field) => {
    const current = institution?.riskControls || {};
    await patchInstitution("/risk-controls", {
      ...current,
      [field]: !current[field],
      reason: riskReason || "Updated by Super Admin"
    }, "Risk controls updated.");
  };

  const recoverAdmin = async (admin, action) => {
    setMessage("");
    setTemporaryPassword("");
    try {
      const res = await api.post(`/super-admin/institutions/${institutionId}/admins/${admin._id}/recovery`, {
        action,
        reason: recoveryReason || "Super Admin recovery"
      });
      if (res.data.temporaryPassword) {
        setTemporaryPassword(res.data.temporaryPassword);
      }
      setMessage("Admin recovery action completed.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not recover admin.");
    }
  };

  const impersonateAdmin = async (admin) => {
    setMessage("");
    setTemporaryPassword("");
    try {
      const res = await api.post(`/super-admin/institutions/${institutionId}/admins/${admin._id}/impersonate`, {
        reason: impersonationReason || "Support investigation approved by institution"
      });
      startImpersonation(res.data.user, res.data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not start support mode.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-8">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-bold text-surface-900/40">Synchronizing Control Depth...</p>
      </div>
    );
  }

  if (!institution) {
    return <div className="p-8 text-rose-600 font-bold">{message || "Institution not found."}</div>;
  }

  const summary = institution.subscriptionSummary || {};
  const usage = summary.usage || {};
  const breakdown = institution.usageBreakdown || {};
  const risk = institution.riskControls || {};
  const archived = Boolean(institution.lifecycle?.archivedAt);

  return (
    <div className="px-8 space-y-10">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-reveal">
        <div>
          <Link to="/super-admin/institutions" className="group mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Command Center
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-black tracking-tight">{institution.name}</h1>
            <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${institution.isActive ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
              {institution.isActive ? 'Live' : 'Inactive'}
            </div>
          </div>
          <p className="mt-2 text-surface-900/60 dark:text-slate-400 font-medium">
            {institution.code} • {institution.type} • <span className="uppercase text-primary">{institution.subscription?.status}</span>
          </p>
        </div>
        
        <button onClick={load} className="flex items-center justify-center gap-2 rounded-2xl bg-surface-900 px-6 py-3 text-sm font-black text-white hover:bg-black transition-all dark:bg-white dark:text-slate-900">
          <RefreshCw className="h-4 w-4" />
          Sync State
        </button>
      </section>

      {message && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-bold text-primary flex items-center gap-3 backdrop-blur-md">
          <Zap className="h-5 w-5" />
          {message}
        </div>
      )}

      {temporaryPassword && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <span>Temporary password issued:</span>
            <span className="font-mono font-black bg-white px-3 py-1 rounded-lg border border-amber-100">{temporaryPassword}</span>
          </div>
          <p className="text-[10px] font-black uppercase">Expires after first login</p>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SmallMetric label="Platform Users" value={usage.students || 0} detail={`Cap: ${summary.limits?.students ?? "∞"}`} icon={<BarChart3 />} />
        <SmallMetric label="Total Collections" value={`₹${Number(breakdown.payments?.totalAmount || 0).toLocaleString("en-IN")}`} detail={`${breakdown.payments?.totalCount || 0} Trx`} icon={<CreditCard />} />
        <SmallMetric label="Reminders Sent" value={breakdown.reminders || 0} detail={`Cap: ${summary.limits?.reminderCampaigns ?? "∞"}`} icon={<Zap />} />
        <SmallMetric label="Active Branches" value={breakdown.branches?.active || 0} detail={`${breakdown.branches?.total || 0} Total`} icon={<Layers />} />
      </div>

      {/* Control Modules Grid */}
      <div className="grid gap-8 xl:grid-cols-2">
        
        {/* Module 1: Billing & Renewal */}
        <ControlModule title="Commercial Lifecycle" icon={<RotateCcw className="text-primary" />}>
          <div className="grid gap-4 md:grid-cols-3">
            <ControlInput label="Tier" type="select" value={subscriptionForm.plan} onChange={(val) => setSubscriptionForm({ ...subscriptionForm, plan: val })} 
              options={[["starter", "Starter"], ["growth", "Growth"], ["enterprise", "Enterprise"]]} 
            />
            <ControlInput label="State" type="select" value={subscriptionForm.status} onChange={(val) => setSubscriptionForm({ ...subscriptionForm, status: val })} 
              options={[["trialing", "Trialing"], ["active", "Active"], ["past_due", "Past Due"], ["paused", "Paused"], ["cancelled", "Cancelled"]]} 
            />
            <ControlInput label="Renewal" type="date" value={subscriptionForm.currentPeriodEndsAt} onChange={(val) => setSubscriptionForm({ ...subscriptionForm, currentPeriodEndsAt: val })} />
          </div>
          <button onClick={saveSubscription} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            <Save className="h-4 w-4" />
            Update Billing Lifecycle
          </button>
        </ControlModule>

        {/* Module 2: Module Overrides */}
        <ControlModule title="Module Toggles" icon={<Settings2 className="text-primary" />}>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 text-[10px] font-black uppercase tracking-wider text-surface-900/40 dark:bg-slate-800/50">
            Override the commercial plan defaults by manually enabling or disabling features for this institution.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => {
              const enabled = (institution.enabledModules || []).includes(module.key);
              return (
                <button
                  key={module.key}
                  onClick={() => toggleModule(module.key)}
                  className={`group rounded-2xl border p-4 text-left transition-all ${
                    enabled
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-surface-200 bg-white text-surface-900/40 hover:border-surface-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-tight">{module.name}</span>
                    {enabled ? <Zap className="h-3 w-3 fill-current" /> : <div className="h-3 w-3 rounded-full border-2 border-current opacity-20" />}
                  </div>
                  <p className="mt-1 text-[10px] font-medium leading-relaxed opacity-70">{module.description}</p>
                </button>
              );
            })}
          </div>
        </ControlModule>

        {/* Module 3: Capacity Overrides */}
        <ControlModule title="Capacity Scalers" icon={<Zap className="text-primary" />}>
          <div className="grid gap-4 md:grid-cols-3">
            <ControlInput label="Student Cap" type="number" value={limitOverrides.students} onChange={(val) => setLimitOverrides({ ...limitOverrides, students: val })} />
            <ControlInput label="Admin Cap" type="number" value={limitOverrides.admins} onChange={(val) => setLimitOverrides({ ...limitOverrides, admins: val })} />
            <ControlInput label="Reminders Cap" type="number" value={limitOverrides.reminderCampaigns} onChange={(val) => setLimitOverrides({ ...limitOverrides, reminderCampaigns: val })} />
          </div>
          <button onClick={saveLimitOverrides} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-surface-900 py-4 text-sm font-black text-surface-900 hover:bg-surface-900 hover:text-white transition-all dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900">
            <Save className="h-4 w-4" />
            Apply Custom Capacity
          </button>
          
          <div className="mt-4 grid gap-4 border-t border-surface-100 pt-6 md:grid-cols-2 dark:border-slate-800">
            <div className="space-y-4">
              <ControlInput label="Extend Trial (Days)" type="number" value={trialDays} onChange={setTrialDays} />
              <button onClick={() => patchInstitution("/trial/extend", { days: trialDays }, "Trial extended.")} className="w-full rounded-2xl bg-surface-100 py-3 text-xs font-black uppercase tracking-widest hover:bg-surface-200 dark:bg-slate-800">
                Grant Extension
              </button>
            </div>
            <div className="space-y-4">
              <ControlInput label="Direct Conversion" type="select" value={convertPlan} onChange={setConvertPlan} 
                options={[["starter", "Starter"], ["growth", "Growth"], ["enterprise", "Enterprise"]]} 
              />
              <button onClick={() => patchInstitution("/trial/convert", { plan: convertPlan }, "Trial converted.")} className="w-full rounded-2xl bg-emerald-500 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-600">
                Convert to Paid
              </button>
            </div>
          </div>
        </ControlModule>

        {/* Module 4: Risk & Compliance */}
        <ControlModule title="Risk & Safety" icon={<ShieldAlert className="text-primary" />}>
          <ControlInput label="Justification Reason" value={riskReason} onChange={setRiskReason} placeholder="e.g. Non-payment, Audit pending..." />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["freezeInstitution", "Freeze All Ops", Archive],
              ["blockPayments", "Block Payments", CreditCard],
              ["disableLogins", "Disable Access", Lock],
              ["restrictExports", "Limit Exports", BarChart3]
            ].map(([field, label, Icon]) => (
              <button
                key={field}
                onClick={() => toggleRisk(field)}
                className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-all border ${
                  risk[field]
                    ? "border-rose-500 bg-rose-500/5 text-rose-600"
                    : "border-surface-200 bg-white text-surface-900/40 hover:bg-surface-50 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${risk[field] ? 'bg-rose-500 text-white' : 'bg-surface-100 dark:bg-slate-800'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{label}</p>
                  <p className="text-[10px] font-bold mt-0.5">{risk[field] ? "ACTIVE" : "INACTIVE"}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 border-t border-surface-100 pt-6 dark:border-slate-800">
            {archived ? (
              <button onClick={() => patchInstitution("/restore", {}, "Restored.")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white">
                <RotateCcw className="h-4 w-4" />
                Reactivate Institution
              </button>
            ) : (
              <div className="space-y-4">
                <ControlInput label="Archive Rationale" value={archiveReason} onChange={setArchiveReason} placeholder="Permanent archive reason..." />
                <button onClick={() => patchInstitution("/archive", { reason: archiveReason || "Super Admin archive" }, "Archived.")} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-500 py-4 text-sm font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <Archive className="h-4 w-4" />
                  Terminate & Archive
                </button>
              </div>
            )}
          </div>
        </ControlModule>

        {/* Module 5: Admin Support & Recovery */}
        <ControlModule title="Support Mode (Impersonation)" icon={<UserCheck className="text-primary" />} className="xl:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <ControlInput label="Recovery Intent" value={recoveryReason} onChange={setRecoveryReason} placeholder="Reason for password override..." />
              <ControlInput label="Investigation Reason" value={impersonationReason} onChange={setImpersonationReason} placeholder="Why are you logging in as this user?" />
              <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                <p className="text-[10px] font-black uppercase text-amber-600 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" />
                  Audit Compliance
                </p>
                <p className="text-[11px] font-medium leading-relaxed text-amber-800/80">
                  Impersonation and recovery actions are logged with your ID, timestamp, and IP address. Ensure you have explicit authorization before proceeding.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40">Registered Organization Admins</p>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin._id} className="glass-card !bg-white/40 !rounded-2xl p-5 border border-surface-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-black text-sm tracking-tight">{admin.name}</p>
                        <p className="text-xs text-surface-900/40">{admin.email}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserCheck size={18} />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => recoverAdmin(admin, "force_password_change")} className="flex-1 rounded-xl bg-surface-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white dark:bg-white dark:text-slate-900">
                        Force Pwd Reset
                      </button>
                      <button onClick={() => recoverAdmin(admin, "temporary_password_reset")} className="flex-1 rounded-xl border border-surface-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider dark:border-white">
                        Issue Temp Pwd
                      </button>
                      <button onClick={() => impersonateAdmin(admin)} className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-amber-500/20">
                        Login As Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ControlModule>

        {/* Recovery History Table */}
        <ControlModule title="Platform Action Audit" icon={<BarChart3 className="text-primary" />} className="xl:col-span-2">
          <div className="overflow-x-auto rounded-2xl border border-surface-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-surface-100 text-sm dark:divide-slate-800">
              <thead className="bg-surface-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Target Admin</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Action Triggered</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Justification</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Performed By</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-surface-900/40">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 bg-white dark:divide-slate-800 dark:bg-slate-900/40">
                {recoveryLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{log.adminId?.email || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-surface-900/5 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-surface-900/60 dark:bg-white/5 dark:text-white">
                        {log.action?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-900/60 dark:text-slate-400">{log.reason}</td>
                    <td className="px-6 py-4 text-xs font-bold">{log.performedBy?.name || "System"}</td>
                    <td className="px-6 py-4 text-[10px] font-black opacity-40">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ControlModule>
      </div>
    </div>
  );
}

function SmallMetric({ label, value, detail, icon }) {
  return (
    <div className="glass-card group p-6 relative overflow-hidden transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40 dark:text-slate-500">{label}</p>
        <div className="text-primary opacity-30 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      </div>
      <p className="font-display text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">{detail}</p>
    </div>
  );
}

function ControlModule({ title, icon, children, className = "" }) {
  return (
    <section className={`glass-card p-8 space-y-6 ${className}`}>
      <div className="flex items-center gap-3 border-b border-surface-100 pb-6 dark:border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {Object.cloneElement(icon, { size: 18, strokeWidth: 2.5 })}
        </div>
        <h2 className="font-display text-lg font-black tracking-tight">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function ControlInput({ label, value, onChange, type = "text", options, placeholder }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-surface-900/40 dark:text-slate-500">{label}</span>
      {type === "select" ? (
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 transition-all outline-none"
        >
          {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 transition-all outline-none placeholder:opacity-30" 
        />
      )}
    </label>
  );
}
