import { useEffect, useState, cloneElement } from "react";
import { 
  Building2, 
  DollarSign, 
  Inbox, 
  PauseCircle, 
  ShieldCheck, 
  Users,
  Activity,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="px-8 space-y-12">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="animate-reveal">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            <ShieldCheck className="h-4 w-4" />
            Executive Oversight
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-surface-900 dark:text-white tracking-tight">
            Platform <span className="text-primary italic">Health.</span>
          </h1>
          <p className="mt-4 text-lg text-surface-900/60 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
            Real-time telemetry across all institutions, trials, and global financial volume.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 text-sm font-black shadow-sm transition-all hover:shadow-md">
            View Audit Logs
          </button>
        </div>
      </section>

      {message && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-rose-600 flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {/* Metrics Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <MetricTile 
          variants={item}
          icon={<Building2 />} 
          label="Total Institutions" 
          value={overview?.institutions?.total || 0} 
          trend="+12% this month"
          color="bg-slate-900 dark:bg-white dark:text-slate-900"
        />
        <MetricTile 
          variants={item}
          icon={<ShieldCheck />} 
          label="Active Tenants" 
          value={overview?.institutions?.active || 0} 
          trend="98.2% Uptime"
          color="bg-primary text-white"
        />
        <MetricTile 
          variants={item}
          icon={<DollarSign />} 
          label="Paid Revenue" 
          value={`₹${Number(overview?.billing?.paid?.amountInr || 0).toLocaleString("en-IN")}`} 
          trend="Growth Phase"
          color="bg-emerald-500 text-white"
        />
        <MetricTile 
          variants={item}
          icon={<Users />} 
          label="Total Users" 
          value={overview?.users?.students || 0} 
          trend="Across platform"
          color="bg-indigo-500 text-white"
        />
      </motion.div>

      {/* Secondary Metrics */}
      <section className="grid gap-6 md:grid-cols-3">
        <StatusCard 
          icon={<Activity />}
          label="Trials Active"
          value={overview?.institutions?.trialing || 0}
          detail="Onboarding Queue"
        />
        <StatusCard 
          icon={<PauseCircle />}
          label="Past Due"
          value={overview?.institutions?.pastDue || 0}
          detail="Awaiting Payment"
          alert={overview?.institutions?.pastDue > 0}
        />
        <StatusCard 
          icon={<Inbox />}
          label="New Leads"
          value={overview?.leads?.new || 0}
          detail="Awaiting Contact"
        />
      </section>
    </div>
  );
}

function MetricTile({ icon, label, value, trend, color, variants }) {
  return (
    <motion.div 
      variants={variants}
      className="glass-card group p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2"
    >
      <div className={`mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${color}`}>
        {cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40 dark:text-slate-500 mb-2">{label}</p>
        <p className="font-display text-3xl font-black tracking-tight">{value}</p>
        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-primary">
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </div>
      </div>
      
      {/* Decorative background accent */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl transition-all group-hover:bg-primary/10" />
    </motion.div>
  );
}

function StatusCard({ icon, label, value, detail, alert }) {
  return (
    <div className="rounded-[32px] border border-surface-200 bg-white/40 p-6 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-rose-500/10 text-rose-500' : 'bg-surface-100 text-surface-900/40 dark:bg-slate-800'}`}>
          {cloneElement(icon, { size: 20 })}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/40 dark:text-slate-500">{label}</p>
          <p className="text-xl font-black mt-0.5">{value}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${alert ? 'text-rose-500' : 'text-surface-900/30'}`}>{detail}</p>
      </div>
    </div>
  );
}
