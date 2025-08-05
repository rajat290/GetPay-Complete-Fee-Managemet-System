import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [assignedFees, setAssignedFees] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const feesRes = await api.get("/fees/assigned");
        setAssignedFees(feesRes.data);
        const historyRes = await api.get("/payments/history");
        setPaymentHistory(historyRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
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

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
          <h1 className="text-xl font-bold">PayWise Institution</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <span>{user?.name || "Student"}</span>
              <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
                {user?.role || "student"}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Summary Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span>Pending Amount</span>
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">₹{totalPending}</div>
              <p className="text-sm">Due fees to be paid</p>
            </div>

            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span>Total Paid</span>
                <Check className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">₹{totalPaid}</div>
              <p className="text-sm">All your completed payments</p>
            </div>

            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span>Next Payment</span>
                <Calendar className="h-5 w-5" />
              </div>
              {upcomingPayments.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    ₹{upcomingPayments[0].amount}
                  </div>
                  <p className="text-sm">
                    Due on {new Date(upcomingPayments[0].dueDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-sm">No upcoming payments</p>
              )}
            </div>

            <div className="bg-gradient-to-r from-red-400 to-red-600 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span>Overdue Fees</span>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{overduePayments.length}</div>
              <p className="text-sm">
                {overduePayments.length > 0
                  ? "Requires immediate attention"
                  : "No overdue payments"}
              </p>
            </div>
          </div>

          {/* Upcoming & Recent Payments */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {/* Upcoming Payments */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4">Upcoming Payments</h2>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{payment.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due on {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{payment.amount}</p>
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-white text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/fees"
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-4"
                  >
                    <CreditCard className="inline-block mr-2 h-4 w-4" />
                    Pay Fees
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No upcoming payments</p>
              )}
            </div>

            {/* Recent Payments */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4">Recent Payments</h2>
              {paymentHistory.filter((p) => p.status === "success").length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory
                    .filter((p) => p.status === "success")
                    .slice(0, 5)
                    .map((payment) => (
                      <div
                        key={payment._id}
                        className="flex justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{payment.feeTitle}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Paid on {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{payment.amount}</p>
                          <span className="bg-green-100 text-green-800 dark:bg-green-700 dark:text-white text-xs px-2 py-1 rounded-full">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  <Link
                    to="/history"
                    className="block text-center border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 py-2 rounded mt-4"
                  >
                    View All History
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No payment history found</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
