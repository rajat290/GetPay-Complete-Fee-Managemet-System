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
  ArrowRight,
  Download,
  FileSpreadsheet,
  Share2,
  Copy
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
  const [assignmentMode, setAssignmentMode] = useState("single"); // 'single' or 'bulk'
  const [className, setClassName] = useState("");
  const [installments, setInstallments] = useState([]);
  const [classOptions] = useState([
    "12thA", "12thB", "11thA", "11thB", "10thA", "10thB", 
    "9thA", "9thB", "8thA", "8thB", "7thA", "7thB"
  ]);

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
      if (assignmentMode === "single") {
        const payload = {
          ...form,
          installments: installments.length > 0 ? installments : null
        };
        await api.post("/fees/assign", payload);
      } else {
        const payload = {
          feeId: form.feeId,
          dueDate: form.dueDate,
          className,
          installments: installments.length > 0 ? installments : null
        };
        await api.post("/fees/assign-bulk", payload);
      }
      
      setMessage({ type: "success", text: "Fee(s) assigned successfully!" });
      setForm({ studentId: "", feeId: "", dueDate: "" });
      setInstallments([]);
      setClassName("");
      const feesRes = await api.get("/fees/assignments");
      setFees(feesRes.data);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Error assigning fee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addInstallment = () => {
    setInstallments([...installments, { name: `Installment ${installments.length + 1}`, amount: 0, dueDate: "" }]);
  };

  const updateInstallment = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
  };

  const removeInstallment = (index) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleExportSummary = async () => {
    try {
      const res = await api.get("/admin/reports/daily-summary", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily_collection_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setMessage({ type: "error", text: "No collections found for today or server error." });
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

  const handleShare = (fee) => {
    const studentName = fee.student?.name || "Student";
    const amount = formatCurrency(fee.amount);
    const dueDate = new Date(fee.dueDate).toLocaleDateString();
    const payUrl = `${window.location.origin}/student/fees`;
    
    const text = `Dear Parent, a fee of ${amount} for ${fee.feeTitle} is due for ${studentName} by ${dueDate}. You can pay online here: ${payUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Fee Payment Link',
        text: text,
        url: payUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Payment message copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and assign fees to individual students.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Download} 
            onClick={handleExportSummary}
            className="hidden md:flex"
          >
            Daily Summary
          </Button>
          <Badge variant="info" className="py-1.5 px-3">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Billing Operations
          </Badge>
        </div>
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
        <div className="lg:col-span-1">
          <Card 
            title="Assign Fee" 
            subtitle="Link fees to students or classes"
            action={
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setAssignmentMode("single")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-premium ${assignmentMode === 'single' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                >
                  Single
                </button>
                <button 
                  onClick={() => setAssignmentMode("bulk")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-premium ${assignmentMode === 'bulk' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                >
                  Bulk
                </button>
              </div>
            }
          >
            <form onSubmit={handleAddFee} className="space-y-5 mt-4">
              {assignmentMode === "single" ? (
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
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Class</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-premium appearance-none"
                  >
                    <option value="">Choose Class</option>
                    {classOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

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

              {installments.length === 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Due Date</label>
                  <Input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              )}

              {/* Installments Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Installment Plan</label>
                  <button 
                    type="button" 
                    onClick={addInstallment}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    + Add Part
                  </button>
                </div>

                {installments.map((inst, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeInstallment(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-premium shadow-lg"
                    >
                      ×
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="Label" 
                        value={inst.name} 
                        onChange={(e) => updateInstallment(index, 'name', e.target.value)}
                        className="h-9 text-xs"
                      />
                      <Input 
                        placeholder="Amount" 
                        type="number"
                        value={inst.amount} 
                        onChange={(e) => updateInstallment(index, 'amount', e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Input 
                      type="date" 
                      value={inst.dueDate} 
                      onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                ))}
              </div>

              <Button 
                type="submit" 
                fullWidth 
                icon={assignmentMode === 'bulk' ? UsersIcon : ArrowRight} 
                isLoading={isSubmitting}
                className="h-12 mt-4"
              >
                {assignmentMode === 'bulk' ? `Assign to ${className || 'Class'}` : 'Confirm Assignment'}
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
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
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
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleShare(fee)}
                            className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-premium"
                            title="Share Payment Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
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
