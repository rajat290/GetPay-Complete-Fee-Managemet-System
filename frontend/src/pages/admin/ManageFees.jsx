import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight
} from "lucide-react";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import Input from "../../components/common/Input";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ManageFees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ studentId: "", feeId: "", dueDate: "" });
  const [feesList, setFeesList] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, allFeesRes, assignmentsRes] = await Promise.all([
          api.get("/admin/students"),
          api.get("/fees/"),
          api.get("/fees/assignments")
        ]);
        setStudents(studentsRes.data.data || studentsRes.data);
        setFeesList(allFeesRes.data);
        setFees(assignmentsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      await api.post("/fees/assign", form);
      setMessage({ type: "success", text: "Fee assigned successfully!" });
      setForm({ studentId: "", feeId: "", dueDate: "" });
      const feesRes = await api.get("/fees/assignments");
      setFees(feesRes.data);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Error assigning fee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and assign fees to individual students.</p>
        </div>
        <Badge variant="info" className="py-1.5 px-3">
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          Billing Operations
        </Badge>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Form */}
        <div className="lg:col-span-1">
          <Card title="Assign New Fee" subtitle="Link a fee to a student account">
            <form onSubmit={handleAddFee} className="space-y-5 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student</label>
                <select
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-premium appearance-none"
                >
                  <option value="">Choose Student</option>
                  {students.map((stu) => (
                    <option key={stu._id} value={stu._id}>
                      {stu.name} ({stu.registrationNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Template</label>
                <select
                  name="feeId"
                  value={form.feeId}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-premium appearance-none"
                >
                  <option value="">Select Fee Type</option>
                  {feesList.map((fee) => (
                    <option key={fee._id} value={fee._id}>
                      {fee.title} ({formatCurrency(fee.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Due Date</label>
                <Input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                fullWidth 
                icon={ArrowRight} 
                isLoading={isSubmitting}
                className="h-12 mt-4"
              >
                Confirm Assignment
              </Button>
            </form>
          </Card>
        </div>

        {/* Assignments Table */}
        <div className="lg:col-span-2">
          <Card title="Current Assignments" subtitle="Live tracking of student liabilities" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student / Registration</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee / Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {fees.length > 0 ? (
                    fees.map((fee) => (
                      <tr key={fee._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-premium">
                              <User className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                {fee.student?.name || "Deleted Student"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                {fee.student?.registrationNo || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{fee.feeTitle}</p>
                          <p className="text-[10px] font-black text-primary uppercase">{formatCurrency(fee.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={fee.status === "paid" ? "success" : fee.status === "overdue" ? "error" : "warning"}
                            className="px-2 py-0"
                          >
                            {fee.status === "paid" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : fee.status === "overdue" ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs font-medium">{new Date(fee.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                          <Plus className="w-12 h-12 mb-2" />
                          <p className="text-sm font-bold">No assignments yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
