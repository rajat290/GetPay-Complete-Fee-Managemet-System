import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageFees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ studentId: "", feeTitle: "", amount: "", dueDate: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await api.get("/admin/students");
        const feesRes = await api.get("/admin/fees");
        setStudents(studentsRes.data);
        setFees(feesRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/fees", form);
      setFees([...fees, res.data]);
      setMessage("Fee assigned successfully!");
      setForm({ studentId: "", feeTitle: "", amount: "", dueDate: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Error assigning fee");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Fees</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>
      )}

      {/* Assign Fee Form */}
      <form onSubmit={handleAddFee} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">Assign New Fee</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Select Student</option>
            {students.map((stu) => (
              <option key={stu._id} value={stu._id}>
                {stu.name} ({stu.registrationNo})
              </option>
            ))}
          </select>
          <input
            type="text"
            name="feeTitle"
            placeholder="Fee Title (e.g. Tuition, Transport)"
            value={form.feeTitle}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Assign Fee
        </button>
      </form>

      {/* Fees Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Fee Title</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4">{fee.student?.name}</td>
                <td className="py-3 px-4">{fee.feeTitle}</td>
                <td className="py-3 px-4">₹{fee.amount}</td>
                <td className="py-3 px-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      fee.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : fee.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
