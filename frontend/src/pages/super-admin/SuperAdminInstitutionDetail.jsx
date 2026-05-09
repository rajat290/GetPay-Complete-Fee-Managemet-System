import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw, FiSave, FiShield } from "react-icons/fi";
import { AuthContext } from "../../context/authContextValue";
import api from "../../services/api";

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
    return <div className="p-8 text-slate-500">Loading institution control...</div>;
  }

  if (!institution) {
    return <div className="p-8 text-red-600">{message || "Institution not found."}</div>;
  }

  const summary = institution.subscriptionSummary || {};
  const usage = summary.usage || {};
  const breakdown = institution.usageBreakdown || {};
  const risk = institution.riskControls || {};
  const archived = Boolean(institution.lifecycle?.archivedAt);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/super-admin/institutions" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <FiArrowLeft className="h-4 w-4" />
            Back to institutions
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Institution control depth</p>
          <h1 className="mt-1 text-2xl font-bold">{institution.name}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {institution.code} . {institution.type} . {institution.subscription?.status}
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {message}
        </div>
      )}
      {temporaryPassword && (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Temporary password issued: <span className="font-mono font-bold">{temporaryPassword}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Students" value={usage.students || 0} detail={`Limit ${summary.limits?.students ?? "Unlimited"}`} />
        <Metric label="Admins" value={usage.admins || 0} detail={`Limit ${summary.limits?.admins ?? "Unlimited"}`} />
        <Metric label="Staff" value={breakdown.staff || 0} detail="Operational users" />
        <Metric label="Collections" value={`INR ${Number(breakdown.payments?.totalAmount || 0).toLocaleString("en-IN")}`} detail={`${breakdown.payments?.totalCount || 0} payments`} />
        <Metric label="Reminders" value={breakdown.reminders || 0} detail={`Limit ${summary.limits?.reminderCampaigns ?? "Unlimited"}`} />
        <Metric label="Branches" value={breakdown.branches?.active || 0} detail={`${breakdown.branches?.total || 0} total`} />
        <Metric label="Receipts" value={breakdown.receipts || 0} detail="Generated PDFs" />
        <Metric label="Storage" value={`${breakdown.storage?.estimatedMb || 0} MB`} detail="Estimated receipt storage" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Subscription Renewal Control">
          <div className="grid gap-3 md:grid-cols-3">
            <Select label="Plan" value={subscriptionForm.plan} onChange={(value) => setSubscriptionForm({ ...subscriptionForm, plan: value })} options={[
              ["starter", "Starter"],
              ["growth", "Growth"],
              ["enterprise", "Enterprise"]
            ]} />
            <Select label="Status" value={subscriptionForm.status} onChange={(value) => setSubscriptionForm({ ...subscriptionForm, status: value })} options={[
              ["trialing", "Trialing"],
              ["active", "Active"],
              ["past_due", "Past due"],
              ["paused", "Paused"],
              ["cancelled", "Cancelled"]
            ]} />
            <Input label="Renewal date" type="date" value={subscriptionForm.currentPeriodEndsAt} onChange={(value) => setSubscriptionForm({ ...subscriptionForm, currentPeriodEndsAt: value })} />
          </div>
          <button onClick={saveSubscription} className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            <FiSave className="h-4 w-4" />
            Save Subscription
          </button>
        </Card>

        <Card title="Module Access">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-slate-300">
            Plan modules are the commercial default. Manual toggles below are the Super Admin override currently enforced for this institution.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((module) => {
              const enabled = (institution.enabledModules || []).includes(module.key);
              return (
                <button
                  key={module.key}
                  onClick={() => toggleModule(module.key)}
                  className={`rounded-md border px-4 py-3 text-left text-sm ${
                    enabled
                      ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-gray-800 dark:bg-gray-800 dark:text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{module.name}</div>
                  <p className="mt-1 text-xs opacity-80">{module.description}</p>
                  <span className="mt-2 inline-block text-xs font-bold">{enabled ? "Enabled override" : "Disabled override"}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Plan, Trial & Limit Overrides">
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Student limit override" type="number" value={limitOverrides.students} onChange={(value) => setLimitOverrides({ ...limitOverrides, students: value })} />
            <Input label="Admin limit override" type="number" value={limitOverrides.admins} onChange={(value) => setLimitOverrides({ ...limitOverrides, admins: value })} />
            <Input label="Reminder limit override" type="number" value={limitOverrides.reminderCampaigns} onChange={(value) => setLimitOverrides({ ...limitOverrides, reminderCampaigns: value })} />
          </div>
          <button onClick={saveLimitOverrides} className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            <FiSave className="h-4 w-4" />
            Save Overrides
          </button>

          <div className="grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-2 dark:border-gray-800">
            <div>
              <Input label="Extend trial by days" type="number" value={trialDays} onChange={(value) => setTrialDays(value)} />
              <button onClick={() => patchInstitution("/trial/extend", { days: trialDays }, "Trial extended.")} className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Extend Trial
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Convert to paid plan
                <select value={convertPlan} onChange={(e) => setConvertPlan(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
              <button onClick={() => patchInstitution("/trial/convert", { plan: convertPlan }, "Trial converted to paid.")} className="mt-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                Convert Trial
              </button>
            </div>
          </div>
        </Card>

        <Card title="Risk Controls">
          <Input label="Control reason" value={riskReason} onChange={setRiskReason} />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["freezeInstitution", "Freeze institution"],
              ["blockPayments", "Block payments"],
              ["disableLogins", "Disable logins"],
              ["restrictExports", "Restrict exports"]
            ].map(([field, label]) => (
              <button
                key={field}
                onClick={() => toggleRisk(field)}
                className={`rounded-md px-4 py-3 text-left text-sm font-semibold ${
                  risk[field]
                    ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-200"
                }`}
              >
                <FiShield className="mb-2 h-4 w-4" />
                {label}: {risk[field] ? "On" : "Off"}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Lifecycle">
          {archived ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">Archived: {institution.lifecycle?.archiveReason || "No reason recorded"}</p>
              <button onClick={() => patchInstitution("/restore", {}, "Institution restored.")} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                Restore Institution
              </button>
            </>
          ) : (
            <>
              <Input label="Archive reason" value={archiveReason} onChange={setArchiveReason} />
              <button onClick={() => patchInstitution("/archive", { reason: archiveReason || "Archived by Super Admin" }, "Institution archived.")} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                Archive Institution
              </button>
            </>
          )}
        </Card>

        <Card title="Organization Admin Recovery">
          <Input label="Recovery reason" value={recoveryReason} onChange={setRecoveryReason} />
          <Input label="Support mode reason" value={impersonationReason} onChange={setImpersonationReason} />
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-sm text-slate-500">No organization admins found.</p>
            ) : admins.map((admin) => (
              <div key={admin._id} className="rounded-md border border-slate-200 p-3 dark:border-gray-800">
                <div className="font-semibold">{admin.name}</div>
                <div className="text-xs text-slate-500">{admin.email}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => recoverAdmin(admin, "force_password_change")} className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-200">
                    Force Password Change
                  </button>
                  <button onClick={() => recoverAdmin(admin, "temporary_password_reset")} className="rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">
                    Reset Temporary Password
                  </button>
                  <button onClick={() => impersonateAdmin(admin)} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
                    Login as Admin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recovery History" className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {recoveryLogs.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">No recovery actions yet.</td></tr>
              ) : recoveryLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-4 py-3">{log.adminId?.email || "Admin"}</td>
                  <td className="px-4 py-3">{log.action?.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{log.reason}</td>
                  <td className="px-4 py-3">{log.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
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
