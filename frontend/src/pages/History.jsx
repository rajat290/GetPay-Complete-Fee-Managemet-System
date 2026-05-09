import { useEffect, useState } from "react";
import { 
  History as HistoryIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText
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

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payments/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.feeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Card noPadding>
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all your financial transactions.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Input 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / Fee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((payment) => (
                  <tr key={payment._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          payment.status === "success" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                        }`}>
                          {payment.status === "success" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{payment.feeTitle}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Ref: {payment._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-slate-900 dark:text-white text-sm">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Badge variant={payment.status === "success" ? "success" : "error"} className="px-2 py-0.5">
                          {payment.status === "success" ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Failed</>
                          )}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-medium">{new Date(payment.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" icon={FileText} className="text-slate-400 hover:text-primary" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <HistoryIcon className="w-12 h-12 mb-2" />
                      <p className="text-sm font-bold">No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
