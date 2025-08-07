import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

  const handlePay = async (assignmentId, amount) => {
    setMessage("Processing payment...");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setMessage("Failed to load payment gateway. Please try again later.");
      return;
    }
    try {
      // 1. Create order on backend
      const res = await api.post("/payments/create-order", { amount, assignmentId });
      const { orderId, key, currency } = res.data;
      // 2. Open Razorpay modal
      const options = {
        key,
        amount: amount * 100,
        currency,
        name: "PayWise Institution",
        description: "Fee Payment",
        order_id: orderId,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              assignmentId,
              amount,
            });
            setMessage("Payment successful! Receipt will be generated shortly.");
            // Wait a moment for backend processing, then refresh fees
            setTimeout(async () => {
              try {
                const updated = await api.get("/fees/my-fees");
                setFees(updated.data);
              } catch (err) {
                console.error("Error refreshing fees:", err);
              }
            }, 2000);
          } catch (err) {
            setMessage("Payment verification failed!");
          }
        },
        prefill: {},
        theme: { color: "#2563eb" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed!");
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
                  Amount: ₹{fee.amount} | Due: {new Date(fee.dueDate).toLocaleDateString()}
                </p>
              </div>
              {fee.status === "pending" ? (
                <button
                  onClick={() => handlePay(fee._id, fee.amount)}
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
