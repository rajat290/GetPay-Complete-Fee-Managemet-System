import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Bell,
  ArrowUpRight,
  Wallet
} from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/authContextValue";
import StudentProfileModal from "../components/StudentProfileModal";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Skeleton from "../components/common/Skeleton";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [assignedFees, setAssignedFees] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [feesRes, historyRes] = await Promise.all([
          api.get("/fees/my-fees"),
          api.get("/payments/history")
        ]);
        
        setAssignedFees(feesRes.data);
        setPaymentHistory(historyRes.data);
        
        try {
          const notifRes = await api.get("/notifications/unread-count");
          setUnreadNotifications(notifRes.data.count);
        } catch (err) {
          console.error("Error fetching notification count:", err);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingPayments = assignedFees
    .filter((f) => f.status === "pending")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const overduePayments = assignedFees.filter((f) => f.status === "overdue");

  const totalPaid = paymentHistory
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = assignedFees
    .filter((f) => f.status !== "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      {/* Welcome & Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
        
        <div className="flex items-center gap-5 relative">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-1">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-[14px] object-cover border-2 border-white dark:border-slate-900" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-2xl uppercase">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hi, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back to your portal.</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info" className="px-2 py-0">{user?.className}</Badge>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{user?.registrationNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <Button variant="secondary" icon={User} onClick={() => setShowProfileModal(true)}>
            Edit Profile
          </Button>
          <Link to="/student/notifications" className="relative group">
            <Button variant="ghost" icon={Bell} className="bg-slate-100 dark:bg-slate-800" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:border-primary/20 transition-premium border-l-4 border-l-primary">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPending)}</h3>
            </div>
          </div>
        </Card>

        <Card className="hover:border-emerald-500/20 transition-premium border-l-4 border-l-emerald-500">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPaid)}</h3>
            </div>
          </div>
        </Card>

        <Card className="hover:border-amber-500/20 transition-premium border-l-4 border-l-amber-500">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Bill</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{nextPayment ? formatCurrency(nextPayment.amount) : "₹0"}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                {nextPayment ? `Due ${new Date(nextPayment.dueDate).toLocaleDateString()}` : "All clear"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="hover:border-rose-500/20 transition-premium border-l-4 border-l-rose-500">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Items</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{overduePayments.length}</h3>
              <p className="text-[10px] text-rose-500 font-bold mt-1">
                {overduePayments.length > 0 ? "Action Required" : "No overdue fees"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Upcoming & Pay Now */}
        <div className="lg:col-span-3 space-y-6">
          <Card 
            title="Upcoming Payments" 
            subtitle="Don't miss these deadlines"
            action={<Link to="/student/fees" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Manage</Link>}
          >
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4 mt-2">
                {upcomingPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-premium hover:shadow-md group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-premium">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{payment.title}</p>
                        <p className="text-xs text-slate-500 font-medium italic">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      <Badge variant="warning" className="mt-1">Pending</Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Link to="/student/fees">
                    <Button fullWidth icon={ArrowUpRight} className="h-12 text-md">
                      Proceed to Payments
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Fully Settled!</h4>
                <p className="text-sm text-slate-500 mt-1">You have no upcoming fees at the moment.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <Card 
            title="Recent History" 
            subtitle="Your latest transactions"
            action={<Link to="/student/history" className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors">History</Link>}
          >
            <div className="space-y-6 mt-2">
              {paymentHistory.filter(p => p.status === "success").length > 0 ? (
                paymentHistory.filter(p => p.status === "success").slice(0, 4).map((payment) => (
                  <div key={payment._id} className="flex items-center gap-4 relative">
                    <div className="w-2 h-full absolute left-[19px] top-10 border-l-2 border-dashed border-slate-100 dark:border-slate-800 last:hidden" />
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white dark:border-slate-900 shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{payment.feeTitle}</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        {new Date(payment.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No transactions found</p>
                </div>
              )}
              <Link to="/student/history" className="block">
                <Button variant="secondary" fullWidth className="h-10 text-xs font-bold uppercase">
                  View Full Statement
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
}
