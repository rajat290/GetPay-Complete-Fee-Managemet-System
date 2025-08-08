import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiCheck,
  FiCreditCard,
  FiFileText,
  FiArrowRight,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle
} from "react-icons/fi";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import StudentProfileModal from "../components/StudentProfileModal";

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
        
        // Fetch unread notification count
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
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Student Profile Box */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100 dark:border-blue-900">
                  <FiUser className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'Student Name'}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium">{user?.className || 'Class'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registration: {user?.registrationNo || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiUser className="h-4 w-4" />
            <span>View Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Mobile 2x2, Desktop 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Amount */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <FiClock className="h-6 w-6" />
            </div>
            <FiTrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-amber-100 text-sm font-medium">Pending Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
            <p className="text-amber-100 text-xs">Due fees to be paid</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FiCheck className="h-6 w-6" />
            </div>
            <FiTrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-green-100 text-sm font-medium">Total Paid</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            <p className="text-green-100 text-xs">All completed payments</p>
          </div>
        </div>

        {/* Next Payment */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FiCalendar className="h-6 w-6" />
            </div>
            <FiArrowRight className="h-5 w-5 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-blue-100 text-sm font-medium">Next Payment</p>
            {nextPayment ? (
              <>
                <p className="text-2xl font-bold">{formatCurrency(nextPayment.amount)}</p>
                <p className="text-blue-100 text-xs">
                  Due {new Date(nextPayment.dueDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">₹0</p>
                <p className="text-blue-100 text-xs">No upcoming payments</p>
              </>
            )}
          </div>
        </div>

        {/* Overdue Fees */}
        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <FiAlertCircle className="h-5 w-5 opacity-80" />
          </div>
          <div className="space-y-1">
            <p className="text-red-100 text-sm font-medium">Overdue Fees</p>
            <p className="text-2xl font-bold">{overduePayments.length}</p>
            <p className="text-red-100 text-xs">
              {overduePayments.length > 0 ? "Requires attention" : "No overdue payments"}
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Payments</h3>
              <Link
                to="/student/fees"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                        <FiCalendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{payment.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
                <Link
                  to="/student/fees"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiCreditCard className="h-4 w-4" />
                  <span>Pay Fees Now</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No upcoming payments</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
              <Link
                to="/student/history"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {paymentHistory.filter((p) => p.status === "success").length > 0 ? (
              <div className="space-y-4">
                {paymentHistory
                  .filter((p) => p.status === "success")
                  .slice(0, 5)
                  .map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <FiCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.feeTitle}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Paid {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                <Link
                  to="/student/history"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiFileText className="h-4 w-4" />
                  <span>View All History</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No payment history found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Your payment history will appear here</p>
              </div>
            )}
          </div>
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
