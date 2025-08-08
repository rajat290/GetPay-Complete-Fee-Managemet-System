import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiFileText, FiCalendar, FiDownload, FiBell, FiUser, FiChevronDown } from "react-icons/fi";
import api from "../../services/api";
import PaymentDetailsModal from "../../components/PaymentDetailsModal";
import NewPaymentNotification from "../../components/NewPaymentNotification";

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalReceived: { amount: 0, percentageChange: 0, trend: 'up' },
    pending: { amount: 0, count: 0 },
    failed: { amount: 0, count: 0 }
  });
  const [classNames, setClassNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPaymentNotification, setNewPaymentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedStatus, dateRange]);

  // Real-time updates - poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedClass, selectedStatus, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments with filters
      const paymentParams = new URLSearchParams();
      if (selectedClass) paymentParams.append('className', selectedClass);
      if (selectedStatus !== 'all') paymentParams.append('status', selectedStatus);
      if (searchTerm) paymentParams.append('search', searchTerm);
      if (dateRange.startDate) paymentParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) paymentParams.append('endDate', dateRange.endDate);
      
      const [paymentsRes, statsRes, classesRes] = await Promise.all([
        api.get(`/admin/payments?${paymentParams}`),
        api.get(`/admin/payments/stats?${paymentParams}`),
        api.get('/admin/classes')
      ]);
      
      // Check for new payments
      const previousPaymentIds = new Set(payments.map(p => p._id));
      const newPayments = paymentsRes.data.filter(p => !previousPaymentIds.has(p._id));
      
      if (newPayments.length > 0 && payments.length > 0) {
        const latestNewPayment = newPayments[0];
        setNewPaymentNotification(latestNewPayment);
        setShowNotification(true);
      }
      
      setPayments(paymentsRes.data);
      setStats(statsRes.data);
      setClassNames(classesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleExport = () => {
    // Export functionality - you can implement CSV export here
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Payment ID,Student ID,Student,Amount,Type,Date,Status,Razorpay Transaction ID\n" +
      payments.map(p => 
        `${p.paymentId},${p.studentId},${p.student},${p.amount},${p.type},${new Date(p.date).toLocaleDateString()},${p.status},${p.razorpayTransactionId}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePaymentDetails = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentId(null);
  };

  const closeNotification = () => {
    setShowNotification(false);
    setNewPaymentNotification(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PayWise Institution</h1>
              <p className="text-gray-600">Payments Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiBell className="h-6 w-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Raj Kumar Singh</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <FiChevronDown className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Received */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Received</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalReceived.amount)}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-100 text-sm">
                    {stats.totalReceived.trend === 'up' ? '+' : '-'}{stats.totalReceived.percentageChange}% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-400 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.pending.amount)}</p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-100 text-sm">
                    {stats.pending.count} payments
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Failed</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.failed.amount)}</p>
                <div className="flex items-center mt-2">
                  <span className="text-red-100 text-sm">
                    {stats.failed.count} payment
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-400 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center space-x-3">
              {/* Class Filter */}
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classNames.map((className) => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Date Range */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FiCalendar className="h-4 w-4 mr-2" />
                  Date Range
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Report Button */}
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <FiFileText className="h-4 w-4 mr-2" />
                Report
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <FiDownload className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razorpay Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {payment.paymentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.student}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.razorpayTransactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${getStatusDot(payment.status)} mr-2`}></div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status === 'completed' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <button 
                           onClick={() => handlePaymentDetails(payment._id)}
                           className="text-blue-600 hover:text-blue-900 cursor-pointer"
                         >
                           Details
                         </button>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-sm text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
                 </div>
       </div>

       {/* Payment Details Modal */}
       <PaymentDetailsModal
         paymentId={selectedPaymentId}
         isOpen={showPaymentModal}
         onClose={closePaymentModal}
       />

       {/* New Payment Notification */}
       <NewPaymentNotification
         isVisible={showNotification}
         payment={newPaymentNotification}
         onClose={closeNotification}
       />
     </div>
   );
 }
