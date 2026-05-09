import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  History,
  Receipt
} from "lucide-react";
import api from "../services/api";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Skeleton from "../components/common/Skeleton";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusConfig = {
  paid: {
    label: "Paid",
    variant: "success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
  },
  overdue: {
    label: "Overdue",
    variant: "error",
    icon: AlertTriangle,
  },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Fees() {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingAssignmentId, setPayingAssignmentId] = useState("");
  const [message, setMessage] = useState(null);
  const [activeFilter, setActiveFilter] = useState("open");

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/fees/my-ledger");
      setLedger(res.data);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Could not load fee ledger." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const summary = ledger?.summary || {};

  const visibleRows = useMemo(() => {
    const rows = ledger?.rows || [];
    if (activeFilter === "all") return rows;
    if (activeFilter === "open") return rows.filter((row) => row.ledgerStatus !== "paid");
    return rows.filter((row) => row.ledgerStatus === activeFilter);
  }, [activeFilter, ledger]);

  const handlePay = async (row) => {
    setMessage({ type: "info", text: "Preparing secure payment..." });
    setPayingAssignmentId(row.assignmentId);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setMessage({ type: "error", text: "Payment gateway could not load. Please try again." });
      setPayingAssignmentId("");
      return;
    }

    try {
      const res = await api.post("/payments/create-order", {
        assignmentId: row.assignmentId,
        amount: row.assignedAmount,
      });
      const { orderId, key, currency, amount } = res.data;

      const checkout = new window.Razorpay({
        key,
        amount,
        currency,
        name: "GetPay Education",
        description: row.fee?.title || "Fee payment",
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              assignmentId: row.assignmentId,
              amount: row.assignedAmount,
            });
            setMessage({ type: "success", text: "Payment verified. Your ledger has been updated." });
            await fetchLedger();
          } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Payment verification failed." });
          } finally {
            setPayingAssignmentId("");
          }
        },
        modal: {
          ondismiss: () => {
            setMessage(null);
            setPayingAssignmentId("");
          },
        },
        theme: { color: "#4F46E5" },
      });

      checkout.open();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Payment could not be started." });
      setPayingAssignmentId("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Statement</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review your financial obligations and settle dues securely.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchLedger}>
            Sync Ledger
          </Button>
          <Badge variant="success" className="py-1.5 px-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            SSL Encrypted
          </Badge>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
          message.type === "error" ? "bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
          "bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
        }`}>
          <div className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-emerald-500" : message.type === "error" ? "bg-rose-500" : "bg-blue-500"}`} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Assigned Total" value={formatCurrency(summary.assignedAmount)} icon={FileText} variant="info" />
        <MetricCard label="Settled Amount" value={formatCurrency(summary.paidAmount)} icon={CheckCircle2} variant="success" />
        <MetricCard label="Balance Dues" value={formatCurrency(summary.pendingAmount)} icon={Clock} variant="warning" />
        <MetricCard label="Overdue Penalties" value={formatCurrency(summary.overdueAmount)} icon={AlertTriangle} variant="error" />
      </div>

      {/* Ledger Section */}
      <Card 
        title="Ledger Entries" 
        subtitle={`${summary.assignmentCount || 0} Total Records | ${summary.paidCount || 0} Paid`}
        noPadding
        action={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["open", "overdue", "paid", "all"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-premium ${
                  activeFilter === filter 
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        }
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleRows.length > 0 ? (
            visibleRows.map((row) => (
              <LedgerRow
                key={row.assignmentId}
                row={row}
                isPaying={payingAssignmentId === row.assignmentId}
                onPay={() => handlePay(row)}
              />
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">All Clear</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">No pending or overdue entries found for this category.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function LedgerRow({ row, isPaying, onPay }) {
  const config = statusConfig[row.ledgerStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const payments = row.payments || [];

  return (
    <div className="group p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
        {/* Info Column */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-premium">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {row.fee?.title || "Fee Assignment"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={config.variant} className="px-1.5 py-0">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Due: {new Date(row.dueDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(row.balanceAmount)}
              </p>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Outstanding Balance</p>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(row.assignedAmount)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Paid</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.paidAmount)}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase mb-1">Status</p>
              <p className="text-sm font-bold text-primary capitalize">{row.ledgerStatus}</p>
            </div>
          </div>

          {/* Payment History Sub-ledger */}
          {payments.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <History className="w-3 h-3" /> Recent Transactions
              </p>
              <div className="space-y-3">
                {payments.slice(0, 2).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400">#{payment.paymentId.slice(-6)}</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Column */}
        <div className="w-full lg:w-48 flex flex-col items-center justify-center gap-3">
          {row.ledgerStatus === "paid" ? (
            <div className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              Settled
            </div>
          ) : (
            <Button
              fullWidth
              onClick={onPay}
              isLoading={isPaying}
              icon={CreditCard}
              className="h-12 shadow-lg shadow-primary/20"
            >
              Pay Now
            </Button>
          )}
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Secured via Razorpay API
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, variant }) {
  const variants = {
    info: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
    success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    error: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
  };

  return (
    <Card className="hover:border-primary/20 transition-premium">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${variants[variant]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
    </Card>
  );
}
