import { useEffect, useState } from "react";
import { FiDownload, FiCalendar, FiTrendingUp, FiDollarSign, FiUsers, FiBarChart2 } from "react-icons/fi";
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
      const params = new URLSearchParams();
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      if (reportFilters.className) params.append('className', reportFilters.className);

      const response = await api.get(`/analytics/class-report?${params}`);
      setReportData(response.data.reportData);
    } catch (error) {
      console.error("Error generating report:", error);
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
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Chart configurations
  const monthlyRevenueChart = {
    labels: analytics.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: analytics.monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const classWiseChart = {
    labels: analytics.classWiseData.map(item => item.className),
    datasets: [
      {
        label: 'Total Revenue',
        data: analytics.classWiseData.map(item => item.totalRevenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Pending Amount',
        data: analytics.classWiseData.map(item => item.pendingAmount),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
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
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Comprehensive financial insights and collection reports</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FiDollarSign className="h-8 w-8 mr-4" />
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FiTrendingUp className="h-8 w-8 mr-4" />
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Payments</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.pendingPayments)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FiBarChart2 className="h-8 w-8 mr-4" />
            <div>
              <p className="text-blue-100 text-sm font-medium">Collection Rate</p>
              <p className="text-2xl font-bold">{analytics.collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FiUsers className="h-8 w-8 mr-4" />
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Classes</p>
              <p className="text-2xl font-bold">{analytics.classWiseData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <Line 
            data={monthlyRevenueChart}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Revenue Trend (Last 12 Months)',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(value);
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Class-wise Collection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Collection</h3>
          <Bar 
            data={classWiseChart}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Revenue by Class',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(value);
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Payment Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
        <div className="flex justify-center">
          <div className="w-64 h-64">
            <Doughnut 
              data={statusDistributionChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Class-wise Collection Report */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Class-wise Collection Report</h3>
          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FiBarChart2 className="h-4 w-4 mr-2" />
              Generate Report
            </button>
            {reportData.length > 0 && (
              <button
                onClick={exportReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiDownload className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={reportFilters.className}
              onChange={(e) => setReportFilters({...reportFilters, className: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(item.completed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {formatCurrency(item.pending)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(item.failed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.collectionRate >= 80 ? 'bg-green-100 text-green-800' :
                        item.collectionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.collectionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FiBarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Generate a report to view class-wise collection data</p>
          </div>
        )}
      </div>
    </div>
  );
}
