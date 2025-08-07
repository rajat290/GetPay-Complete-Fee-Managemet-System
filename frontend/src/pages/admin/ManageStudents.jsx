import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", registrationNo: "", department: "", className: "" });
  const [message, setMessage] = useState("");

  // Use the correct backend route for fetching and adding students
  // According to your backend, the students list is likely at "/users"
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

  // Use the correct backend route for adding a student
  // According to your backend, adding a student is likely at "/users"
  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/admin/students", form);
      setStudents([...students, res.data]);
      setMessage("Student added successfully!");
      setForm({ name: "", email: "", registrationNo: "", department: "", className: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding student");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading students...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>
      )}

      {/* Add Student Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">Add New Student</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="registrationNo"
            placeholder="Registration No"
            value={form.registrationNo}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="className"
            placeholder="Class Name"
            value={form.className}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Add Student
        </button>
      </form>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Reg No</th>
              <th className="py-3 px-4">Department</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.email}</td>
                <td className="py-3 px-4">{student.registrationNo}</td>
                <td className="py-3 px-4">{student.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
