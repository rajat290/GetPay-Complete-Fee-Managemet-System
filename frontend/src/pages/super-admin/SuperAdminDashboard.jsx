import { useEffect, useState } from "react";
import { FiBriefcase, FiPauseCircle, FiShield, FiUsers } from "react-icons/fi";
import api from "../../services/api";

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await api.get("/super-admin/overview");
        setOverview(res.data);
      } catch (error) {
        setMessage(error.response?.data?.error || "Could not load platform overview.");
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          <FiShield className="h-4 w-4" />
          Platform Control
        </p>
        <h1 className="mt-1 text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage organizations, activation, plans, and platform-level usage.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FiBriefcase />} label="Organizations" value={overview?.institutions?.total || 0} />
        <Metric icon={<FiShield />} label="Active" value={overview?.institutions?.active || 0} />
        <Metric icon={<FiPauseCircle />} label="Suspended" value={overview?.institutions?.suspended || 0} />
        <Metric icon={<FiUsers />} label="Students" value={overview?.users?.students || 0} />
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
