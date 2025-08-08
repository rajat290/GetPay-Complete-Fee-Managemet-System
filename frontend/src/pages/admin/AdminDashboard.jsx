import { useEffect, useState } from "react";
import { 
  FiUsers, 
  FiDollarSign, 
  FiClock, 
  FiAlertTriangle, 
  FiTrendingUp,
  // FiBarChart3,
  FiActivity,
  FiCreditCard
} from "react-icons/fi";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from "chart.js";
import api from "../../services/api";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    totalCollected: 0, 
    pendingFees: 0, 
    defaulters: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/analytics");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const barData = {
    labels: ["Collected", "Pending", "Defaulters"],
    datasets: [
      {
        label: "Fee Overview",
        data: [stats.totalCollected, stats.pendingFees, stats.defaulters],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)", 
          "rgba(239, 68, 68, 0.8)"
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)",
          "rgb(239, 68, 68)"
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ["Collected", "Pending"],
    datasets: [
      {
        label: "Fee Distribution",
        data: [stats.totalCollected, stats.pendingFees],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)"
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)"
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(107, 114, 128)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your institution.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <FiActivity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stats.totalStudents)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-100 text-sm">
            <FiTrendingUp className="h-4 w-4 mr-1" />
            <span>Active enrollment</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Collected</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiDollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-100 text-sm">
            <FiTrendingUp className="h-4 w-4 mr-1" />
            <span>This academic year</span>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Fees</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.pendingFees)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiClock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-yellow-100 text-sm">
            <FiAlertTriangle className="h-4 w-4 mr-1" />
            <span>Requires attention</span>
          </div>
        </div>

        {/* Defaulters */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Defaulters</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stats.defaulters)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-red-100 text-sm">
            <FiAlertTriangle className="h-4 w-4 mr-1" />
            <span>Overdue payments</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Overview Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Collection vs Pending vs Defaulters</p>
            </div>
            {/* <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FiBarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div> */}
          </div>
          <div className="h-80">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Fee Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Distribution</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Collected vs Pending ratio</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="h-80">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Add Student</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <FiCreditCard className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Create Fee</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            {/* <FiBarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" /> */}
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">View Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <FiTrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
