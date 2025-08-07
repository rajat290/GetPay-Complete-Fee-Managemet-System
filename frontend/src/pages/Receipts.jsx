import { useEffect, useState } from "react";
import api from "../services/api";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await api.get("/receipts");
        setReceipts(res.data);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  const handleDownload = async (paymentId) => {
    try {
      const res = await api.get(`/receipts/download/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download receipt. Please try again.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading receipts...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Download Receipts</h1>

      {receipts.length > 0 ? (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div
              key={receipt._id}
              className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">{receipt.feeTitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Amount: ₹{receipt.amount} | Paid on {new Date(receipt.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">Payment ID: {receipt.razorpayPaymentId}</p>
              </div>
              <button
                onClick={() => handleDownload(receipt._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Download Receipt
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No receipts available.</p>
      )}
    </div>
  );
}
