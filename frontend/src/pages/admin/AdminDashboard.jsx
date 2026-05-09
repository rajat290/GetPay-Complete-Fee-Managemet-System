import { useEffect, useState } from "react";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Activity,
  CreditCard,
  Plus,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  UserPlus,
  Receipt,
  FileSpreadsheet,
  History
} from "lucide-react";
import { Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from "chart.js";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    totalCollected: 0, 
    pendingFees: 0, 
    defaulters: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const barData = {
    labels: ["Collected", "Pending", "Defaulters"],
    datasets: [
      {
        label: "Value",
        data: [stats.totalCollected, stats.pendingFees, stats.defaulters * 1000], // Mock scale for defaulters
        backgroundColor: [
          "#10B981", // emerald
          "#F59E0B", // amber
          "#F43F5E"  // rose
        ],
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.2)' },
        ticks: { 
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v) => '₹' + (v >= 1000 ? v/1000 + 'k' : v)
        }
      },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Institutional performance at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="neutral" className="py-1.5 px-3">
            <Activity className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            Live System Health
          </Badge>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Last Sync: Just Now</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile label="Total Enrollment" value={stats.totalStudents.toLocaleString()} icon={Users} trend="+4.2%" trendUp color="blue" />
        <StatTile label="Gross Collection" value={formatCurrency(stats.totalCollected)} icon={DollarSign} trend="+18%" trendUp color="emerald" />
        <StatTile label="Outstanding Dues" value={formatCurrency(stats.pendingFees)} icon={Clock} trend="Action Req." color="amber" />
        <StatTile label="Defaulter Count" value={stats.defaulters} icon={AlertCircle} trend="High Priority" color="rose" />
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card 
          title="Revenue Distribution" 
          subtitle="Financial settlement overview"
          className="lg:col-span-2"
          action={<Button size="sm" variant="secondary" icon={ArrowUpRight}>Full Report</Button>}
        >
          <div className="h-72 mt-8">
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Quick Command Center" subtitle="Direct access to core modules">
          <div className="grid grid-cols-1 gap-3 mt-6">
            <QuickAction icon={UserPlus} label="Register Student" href="/admin/students" color="blue" />
            <QuickAction icon={Receipt} label="Generate Invoice" href="/admin/fees" color="emerald" />
            <QuickAction icon={FileSpreadsheet} label="Analytics Hub" href="/admin/analytics" color="purple" />
            <QuickAction icon={History} label="System Logs" href="/admin/audit-trail" color="slate" />
          </div>
        </Card>
      </div>

      {/* Recent Activity Mini Widget (Mock) */}
      <Card title="Operational Stream" subtitle="Latest system events" noPadding>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {[
            { user: "Rajat K.", action: "assigned quarterly fee", time: "2 mins ago", type: "Fee" },
            { user: "Vikas P.", action: "collected offline payment", time: "15 mins ago", type: "Payment" },
            { user: "System", action: "sent automated reminders", time: "1 hour ago", type: "System" },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-premium">
                  {item.type[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    <span className="text-primary">{item.user}</span> {item.action}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.time}</p>
                </div>
              </div>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0">{item.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, trend, trendUp, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10",
    amber: "text-amber-600 bg-amber-500/10",
    rose: "text-rose-600 bg-rose-500/10",
    purple: "text-purple-600 bg-purple-500/10",
    slate: "text-slate-600 bg-slate-500/10",
  };

  return (
    <Card className="hover:border-primary/20 transition-premium relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-premium">
        <Icon className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
      <div className="mt-2 flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${trendUp ? 'bg-emerald-500' : 'bg-primary'}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{trend}</span>
      </div>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, href, color }) {
  const colorMap = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
  };

  return (
    <Link 
      to={href}
      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary transition-premium group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${colorMap[color]} text-white flex items-center justify-center shadow-lg shadow-${color}-500/20`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-premium">{label}</span>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-premium" />
    </Link>
  );
}
