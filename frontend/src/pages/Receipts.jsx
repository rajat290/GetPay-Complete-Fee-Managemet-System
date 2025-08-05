import { useEffect, useState } from "react";
import api from "../services/api";

export default function Receipts() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/payments/history");
        setPayments(res.data);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDownload = async (paymentId) => {
    try {
      const res = await api.get(`/payments/receipt/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading receipts...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Download Receipts</h1>

      {payments.filter((p) => p.status === "success").length > 0 ? (
        <div className="space-y-4">
          {payments
            .filter((p) => p.status === "success")
            .map((payment) => (
              <div
                key={payment._id}
                className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold">{payment.feeTitle}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Paid on {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(payment._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Download Receipt
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p>No paid receipts available.</p>
      )}
    </div>
  );
}
