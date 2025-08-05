import { useEffect, useState } from "react";
import api from "../../services/api";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalCollected: 0, pendingFees: 0, defaulters: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  if (loading) return <div className="text-center mt-10">Loading dashboard...</div>;

  const barData = {
    labels: ["Collected", "Pending", "Defaulters"],
    datasets: [
      {
        label: "Fee Overview",
        data: [stats.totalCollected, stats.pendingFees, stats.defaulters],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Collected", "Pending"],
    datasets: [
      {
        label: "Fee Distribution",
        data: [stats.totalCollected, stats.pendingFees],
        backgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <p>Total Students</p>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </div>
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <p>Total Collected</p>
          <div className="text-2xl font-bold">₹{stats.totalCollected}</div>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
          <p>Pending Fees</p>
          <div className="text-2xl font-bold">₹{stats.pendingFees}</div>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
          <p>Defaulters</p>
          <div className="text-2xl font-bold">{stats.defaulters}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mt-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Fee Overview</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Fee Distribution</h2>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
}
