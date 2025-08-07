import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFees = async () => {
      try {
        const res = await api.get("/fees/my-fees");
        setFees(res.data);
      } catch (err) {
        console.error("Error fetching fees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [navigate]);

  const handlePay = async (feeId) => {
    setMessage("Processing payment...");
    try {
      const res = await api.post("/payments/pay", { feeId });
      setMessage(res.data.message || "Payment successful!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Payment failed!");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading fees...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Pay Your Fees</h1>
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>
      )}

      {fees.length > 0 ? (
        <div className="space-y-4">
          {fees.map((fee) => (
            <div
              key={fee._id}
              className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">{fee.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Amount: ₹{fee.amount} | Due:{" "}
                  {new Date(fee.dueDate).toLocaleDateString()}
                </p>
              </div>
              {fee.status === "pending" ? (
                <button
                  onClick={() => handlePay(fee._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Pay Now
                </button>
              ) : (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                  Paid
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No fees assigned yet.</p>
      )}
    </div>
  );
}
