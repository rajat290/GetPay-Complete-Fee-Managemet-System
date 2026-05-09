import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  FileText,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";
import api from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import DataTable from "../../components/common/DataTable";
import PaymentDetailsModal from "../../components/PaymentDetailsModal";
import NewPaymentNotification from "../../components/NewPaymentNotification";

export default function ManagePayments() {
  const [stats, setStats] = useState({
    totalReceived: { amount: 0, percentageChange: 0, trend: 'up' },
    pending: { amount: 0, count: 0 },
    failed: { amount: 0, count: 0 }
  });
  const [classNames, setClassNames] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPaymentNotification, setNewPaymentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const fetchStatsAndClasses = useCallback(async () => {
    try {
      const [statsRes, classesRes] = await Promise.all([
        api.get('/admin/payments/stats'),
        api.get('/admin/classes')
      ]);
      setStats(statsRes.data);
      setClassNames(classesRes.data);
    } catch (err) {
      console.error("Error fetching meta data:", err);
    }
  }, []);

  useEffect(() => {
    fetchStatsAndClasses();
  }, [fetchStatsAndClasses]);

  const fetchPayments = async (params) => {
    // Add filters to params
    const queryParams = { 
      ...params,
      className: selectedClass !== "all" ? selectedClass : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined
    };
    const res = await api.get("/admin/payments", { params: queryParams });
    return res.data;
  };

  const handleExport = async () => {
    // Basic export functionality
    try {
      const res = await api.get("/admin/payments", { params: { limit: 1000 } });
      const payments = res.data.data;
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Payment ID,Student ID,Student,Amount,Type,Date,Status,Mode,Reference No\n" +
        payments.map(p => 
          `${p.paymentId},${p.studentId},${p.student},${p.amount},${p.type},${new Date(p.date).toLocaleDateString()},${p.status},${p.mode},${p.razorpayTransactionId || p.referenceNo}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `payments_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleDailySummary = async () => {
    try {
      const res = await api.get("/admin/reports/daily-summary");
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daily_summary_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Daily summary export failed", err);
    }
  };

  const columns = [
    { 
      header: "Payment ID", 
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
          {row.paymentId}
        </span>
      )
    },
    { 
      header: "Student", 
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.student}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">{row.studentId}</p>
        </div>
      )
    },
    { 
      header: "Amount", 
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          ₹{row.amount.toLocaleString('en-IN')}
        </span>
      )
    },
    { header: "Type", accessor: "type" },
    { 
      header: "Date", 
      render: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    { 
      header: "Status", 
      render: (row) => (
        <Badge variant={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'error'}>
          {row.status === 'completed' ? 'Paid' : row.status === 'pending' ? 'Pending' : 'Failed'}
        </Badge>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setSelectedPaymentId(row._id);
            setShowPaymentModal(true);
          }}
          icon={Eye}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track collections, manage refunds, and audit transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="secondary" icon={FileText} onClick={handleDailySummary}>
            Daily Summary
          </Button>
          <Button icon={Plus}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Collections</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{stats.totalReceived.amount.toLocaleString('en-IN')}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {stats.totalReceived.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-500" />
                )}
                <span className={`text-xs font-bold ${stats.totalReceived.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stats.totalReceived.percentageChange}%
                </span>
                <span className="text-xs text-slate-400 font-medium">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pending Dues</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{stats.pending.amount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                Across {stats.pending.count} active invoices
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-rose-500/5 border-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Failed Attempts</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{stats.failed.amount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-2">
                {stats.failed.count} failed transactions
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card title="Transaction History" noPadding>
        <DataTable 
          columns={columns}
          fetchData={fetchPayments}
          searchPlaceholder="Search by ID, Student, or Reference..."
          filters={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-premium appearance-none"
                >
                  <option value="all">All Classes</option>
                  {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-premium"
              >
                <option value="all">All Status</option>
                <option value="completed">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          }
        />
      </Card>

      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      <NewPaymentNotification
        isVisible={showNotification}
        payment={newPaymentNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
