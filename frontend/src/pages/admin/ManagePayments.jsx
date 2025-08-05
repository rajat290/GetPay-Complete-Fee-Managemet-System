import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/admin/payments");
        setPayments(res.data);
      } catch (err) {
        console.error("Error fetching payments:", err);
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
      setMessage("Error downloading receipt");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading payments...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Payments</h1>

      {message && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{message}</div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Fee Title</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">{p.student?.name}</td>
                  <td className="py-3 px-4">{p.fee?.feeTitle}</td>
                  <td className="py-3 px-4">₹{p.amount}</td>
                  <td className="py-3 px-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        p.status === "success"
                          ? "bg-green-100 text-green-800"
                          : p.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.status === "success" ? (
                      <button
                        onClick={() => handleDownload(p._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Download
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-600 dark:text-gray-400"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
