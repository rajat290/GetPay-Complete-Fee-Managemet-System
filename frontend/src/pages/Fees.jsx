import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import api from "../services/api";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusConfig = {
  paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    icon: FiCheckCircle,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    icon: FiClock,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    icon: FiAlertTriangle,
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
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("open");

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/fees/my-ledger");
      setLedger(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load fee ledger.");
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
    setMessage("Preparing secure payment...");
    setPayingAssignmentId(row.assignmentId);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setMessage("Payment gateway could not load. Please try again.");
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
            setMessage("Payment verified. Your ledger has been updated.");
            await fetchLedger();
          } catch (error) {
            setMessage(error.response?.data?.message || "Payment verification failed.");
          } finally {
            setPayingAssignmentId("");
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("");
            setPayingAssignmentId("");
          },
        },
        theme: { color: "#1d4ed8" },
      });

      checkout.open();
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment could not be started.");
      setPayingAssignmentId("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Student Fee Ledger
            </p>
            <h1 className="mt-1 text-2xl font-bold">Fees and payments</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Track every assigned fee, due date, payment status, and receipt-ready transaction in one place.
            </p>
          </div>
          <button
            onClick={fetchLedger}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh ledger
          </button>
        </div>

        {message && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<FiFileText className="h-5 w-5" />} label="Assigned" value={formatCurrency(summary.assignedAmount)} tone="blue" />
          <MetricCard icon={<FiCheckCircle className="h-5 w-5" />} label="Paid" value={formatCurrency(summary.paidAmount)} tone="green" />
          <MetricCard icon={<FiClock className="h-5 w-5" />} label="Pending" value={formatCurrency(summary.pendingAmount)} tone="amber" />
          <MetricCard icon={<FiAlertTriangle className="h-5 w-5" />} label="Overdue" value={formatCurrency(summary.overdueAmount)} tone="red" />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Ledger entries</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {summary.assignmentCount || 0} assigned fees, {summary.paidCount || 0} paid, {summary.overdueCount || 0} overdue
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["open", "Open"],
                ["overdue", "Overdue"],
                ["pending", "Pending"],
                ["paid", "Paid"],
                ["all", "All"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    activeFilter === value
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-950 dark:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-gray-800">
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
              <div className="px-4 py-12 text-center">
                <FiShield className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 font-semibold">No matching fee entries</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your ledger will update automatically when the institution assigns new fees.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LedgerRow({ row, isPaying, onPay }) {
  const config = statusConfig[row.ledgerStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const payments = row.payments || [];

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_240px] lg:items-center">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{row.fee?.title || "Assigned fee"}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.className}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {row.fee?.category || "Other"} fee | Due {new Date(row.dueDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg font-bold">{formatCurrency(row.balanceAmount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Balance due</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <AmountPill label="Assigned" value={row.assignedAmount} />
          <AmountPill label="Paid" value={row.paidAmount} />
          <AmountPill label="Balance" value={row.balanceAmount} />
        </div>

        {payments.length > 0 && (
          <div className="rounded-md bg-slate-50 p-3 dark:bg-gray-950">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Payment activity
            </p>
            <div className="space-y-2">
              {payments.slice(0, 3).map((payment) => (
                <div key={payment._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {payment.paymentId} | {payment.mode || "online"} | {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 lg:items-end">
        {row.ledgerStatus === "paid" ? (
          <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            <FiCheckCircle className="h-4 w-4" />
            Completed
          </div>
        ) : (
          <button
            onClick={onPay}
            disabled={isPaying}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCreditCard className="h-4 w-4" />
            {isPaying ? "Opening checkout" : "Pay securely"}
          </button>
        )}
        <p className="max-w-56 text-xs text-slate-500 dark:text-slate-400 lg:text-right">
          Online payments are verified before the ledger is marked paid.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AmountPill({ label, value }) {
  return (
    <div className="rounded-md bg-slate-100 px-3 py-2 dark:bg-gray-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-semibold">{formatCurrency(value)}</p>
    </div>
  );
}
