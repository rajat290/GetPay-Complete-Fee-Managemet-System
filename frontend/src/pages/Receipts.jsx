import { useEffect, useState } from "react";
import { 
  Download, 
  FileText, 
  Search, 
  Receipt as ReceiptIcon,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import api from "../services/api";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Skeleton from "../components/common/Skeleton";
import Input from "../components/common/Input";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/receipts");
        setReceipts(res.data);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  const handleDownload = async (paymentId) => {
    try {
      setMessage("");
      setDownloadingId(paymentId);
      const res = await api.get(`/receipts/download/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${paymentId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setMessage("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredReceipts = receipts.filter(r => 
    r.feeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.razorpayPaymentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Receipts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Download official payment receipts for your records.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Input 
            placeholder="Search receipts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.length > 0 ? (
          filteredReceipts.map((receipt) => (
            <Card key={receipt._id} className="group hover:border-primary/30 transition-premium relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ReceiptIcon className="w-20 h-20 rotate-12" />
              </div>
              
              <div className="space-y-4 relative">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="success" className="px-1.5 py-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate" title={receipt.feeTitle}>
                    {receipt.feeTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {new Date(receipt.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="pt-2 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Amount Paid</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(receipt.amount)}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Download}
                    isLoading={downloadingId === receipt._id}
                    onClick={() => handleDownload(receipt._id)}
                  >
                    PDF
                  </Button>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                    <CreditCard className="w-3 h-3" />
                    ID: {receipt.razorpayPaymentId.slice(-8)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <ShieldCheck className="w-3 h-3" />
                    SECURE
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">No Receipts Found</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Complete a payment to generate your first official receipt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
