import { useEffect, useState } from "react";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  PieChart,
  LineChart,
  ArrowUpRight,
  Filter,
  FileSpreadsheet
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import Input from "../../components/common/Input";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    collectionRate: 0,
    monthlyRevenue: [],
    classWiseData: []
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    className: ""
  });
  const [classOptions, setClassOptions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchClassOptions();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/dashboard");
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassOptions = async () => {
    try {
      const response = await api.get("/admin/classes");
      setClassOptions(response.data);
    } catch (error) {
      console.error("Error fetching class options:", error);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const params = new URLSearchParams();
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      if (reportFilters.className) params.append('className', reportFilters.className);

      const response = await api.get(`/analytics/class-report?${params}`);
      setReportData(response.data.reportData);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Class,Total Amount,Completed,Pending,Failed,Collection Rate (%)\n" +
      reportData.map(item => 
        `${item.className},${item.totalAmount},${item.completed},${item.pending},${item.failed},${item.collectionRate.toFixed(2)}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `collection_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Chart configurations with brand colors
  const monthlyRevenueChart = {
    labels: analytics.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: analytics.monthlyRevenue.map(item => item.revenue),
        borderColor: '#4F46E5', // primary
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const classWiseChart = {
    labels: analytics.classWiseData.map(item => item.className),
    datasets: [
      {
        label: 'Collected',
        data: analytics.classWiseData.map(item => item.totalRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'Pending',
        data: analytics.classWiseData.map(item => item.pendingAmount),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const statusDistributionChart = {
    labels: ['Completed', 'Pending', 'Failed'],
    datasets: [
      {
        data: [
          analytics.classWiseData.reduce((sum, item) => sum + item.totalRevenue, 0),
          analytics.classWiseData.reduce((sum, item) => sum + item.pendingAmount, 0),
          analytics.classWiseData.reduce((sum, item) => sum + item.failedAmount, 0),
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderWidth: 0,
        hoverOffset: 15
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 10, weight: 'bold' },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.3)' },
        ticks: { 
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => '₹' + (value / 1000) + 'k'
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into revenue trends and collection efficiency.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={FileSpreadsheet} onClick={exportReport} disabled={reportData.length === 0}>
            Export Data
          </Button>
          <Badge variant="info" className="py-1.5 px-3">
            <LineChart className="w-3.5 h-3.5 mr-1.5" />
            Financial Year 2024
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Net Revenue" value={formatCurrency(analytics.totalRevenue)} icon={DollarSign} variant="success" trend="+12.5%" />
        <MetricCard label="Outstanding" value={formatCurrency(analytics.pendingPayments)} icon={TrendingUp} variant="warning" trend="Action Required" />
        <MetricCard label="Collection Rate" value={`${analytics.collectionRate.toFixed(1)}%`} icon={BarChart3} variant="info" trend="Industry Peak" />
        <MetricCard label="Active Classes" value={analytics.classWiseData.length} icon={Users} variant="neutral" trend="Scaling" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Revenue Trajectory" subtitle="Growth over the last 12 months" className="lg:col-span-2">
          <div className="h-80 mt-6">
            <Line data={monthlyRevenueChart} options={chartOptions} />
          </div>
        </Card>

        <Card title="Status Mix" subtitle="Payment outcome distribution">
          <div className="h-64 mt-8">
            <Doughnut 
              data={statusDistributionChart} 
              options={{
                ...chartOptions,
                cutout: '75%',
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: true, position: 'bottom' }
                }
              }} 
            />
          </div>
          <div className="mt-8 space-y-3">
            <ChartLegend label="Completed" color="bg-emerald-500" value="78%" />
            <ChartLegend label="Pending" color="bg-amber-500" value="15%" />
            <ChartLegend label="Failed" color="bg-rose-500" value="7%" />
          </div>
        </Card>

        <Card title="Section Performance" subtitle="Revenue breakdown by class" className="lg:col-span-3">
          <div className="h-80 mt-6">
            <Bar data={classWiseChart} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Report Generator Section */}
      <Card 
        title="Custom Report Builder" 
        subtitle="Generate granular collection statements"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => setReportFilters({startDate:"", endDate:"", className:""})} />
            <Button size="sm" icon={BarChart3} isLoading={isGenerating} onClick={generateReport}>Generate</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Period</label>
            <Input 
              type="date" 
              value={reportFilters.startDate} 
              onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Period</label>
            <Input 
              type="date" 
              value={reportFilters.endDate} 
              onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Class</label>
            <select
              value={reportFilters.className}
              onChange={(e) => setReportFilters({...reportFilters, className: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-premium appearance-none"
            >
              <option value="">All Academic Sections</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {reportData.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Section</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settled</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pending</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {reportData.map((item, index) => (
                  <tr key={index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                    <td className="px-6 py-4">
                      <Badge variant="info" className="px-3 py-1">{item.className}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.completed)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-amber-500">{formatCurrency(item.pending)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Badge variant={item.collectionRate >= 80 ? "success" : item.collectionRate >= 50 ? "warning" : "error"}>
                          {item.collectionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center opacity-40">
            <PieChart className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm font-bold">No report data generated yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, variant, trend }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600",
    neutral: "bg-slate-50 text-slate-600",
  };

  return (
    <Card className="hover:border-primary/20 transition-premium group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-12 h-12" />
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${styles[variant]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
      <div className="mt-2 flex items-center gap-1.5">
        <div className={`w-1 h-1 rounded-full ${variant === 'success' ? 'bg-emerald-500' : 'bg-primary'}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{trend}</span>
      </div>
    </Card>
  );
}

function ChartLegend({ label, color, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-slate-500 font-medium">{label}</span>
      </div>
      <span className="font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function RefreshCw({ className, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
