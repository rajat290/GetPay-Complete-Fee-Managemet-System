import { useEffect, useState } from "react";
import api from "../../services/api";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function Analytics() {
  const [stats, setStats] = useState({
    monthlyCollections: [],
    feeDistribution: {},
    defaulters: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading analytics...</div>;

  // Line Chart Data (Monthly Collection Trend)
  const lineData = {
    labels: stats.monthlyCollections.map((m) => m.month),
    datasets: [
      {
        label: "Monthly Collection (₹)",
        data: stats.monthlyCollections.map((m) => m.amount),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Pie Chart Data (Fee Distribution)
  const pieData = {
    labels: Object.keys(stats.feeDistribution),
    datasets: [
      {
        label: "Fee Distribution",
        data: Object.values(stats.feeDistribution),
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Monthly Collection Trend</h2>
          <Line data={lineData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Fee Distribution</h2>
          <Pie data={pieData} />
        </div>
      </div>

      {/* Defaulters List */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Defaulters</h2>
        {stats.defaulters.length > 0 ? (
          <ul className="space-y-2">
            {stats.defaulters.map((stu) => (
              <li key={stu._id} className="flex justify-between border-b pb-2">
                <span>{stu.name} ({stu.registrationNo})</span>
                <span className="text-red-600 font-medium">₹{stu.pendingAmount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No defaulters 🎉</p>
        )}
      </div>
    </div>
  );
}
