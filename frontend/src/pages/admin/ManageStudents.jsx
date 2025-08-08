import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    registrationNo: "", 
    className: "" 
  });
  const [message, setMessage] = useState("");
  const [classOptions] = useState([
    "12thA", "12thB", "11thA", "11thB", "10thA", "10thB", 
    "9thA", "9thB", "8thA", "8thB", "7thA", "7thB"
  ]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/admin/students");
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setMessage("Error fetching students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/admin/students", form);
      setStudents([...students, res.data]);
      setMessage("Student added successfully!");
      setForm({ name: "", email: "", registrationNo: "", className: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding student");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading students...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("successfully") 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      {/* Add Student Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">Add New Student</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input
              type="text"
              name="registrationNo"
              placeholder="Enter registration number"
              value={form.registrationNo}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <select
              name="className"
              value={form.className}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            * Default password will be set to the registration number. Student can change it after first login.
          </p>
        </div>
        
        <button 
          type="submit" 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          Add Student
        </button>
      </form>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Students ({students.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.registrationNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
