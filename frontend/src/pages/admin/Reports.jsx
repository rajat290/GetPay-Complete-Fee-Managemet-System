import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  CreditCard,
  AlertCircle,
  ChevronRight,
  Printer,
  Search
} from "lucide-react";
import api from "../../services/api";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [collectionData, setCollectionData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [modeData, setModeData] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [reconciliation, setReconciliation] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState([]);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [studentLedger, setStudentLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
    fetchClasses();
  }, [dateRange, selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/admin/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [collRes, classRes, modeRes, defRes, recRes] = await Promise.all([
        api.get(`/admin/reports/collection-summary?groupBy=day&days=${dateRange}`),
        api.get(`/admin/reports/class-wise`),
        api.get(`/admin/reports/payment-modes`),
        api.get(`/admin/reports/defaulters?className=${selectedClass}`),
        api.get(`/admin/payments/reconciliation`)
      ]);
      
      setCollectionData(collRes.data);
      setClassData(classRes.data);
      setModeData(modeRes.data);
      setDefaulters(defRes.data);
      setReconciliation(recRes.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLedger = async (regNo) => {
    if (!regNo) return;
    setLedgerLoading(true);
    try {
      const studentsRes = await api.get(`/admin/students?search=${regNo}`);
      const student = studentsRes.data.data.find(s => s.registrationNo === regNo);
      
      if (!student) {
        alert("Student not found");
        return;
      }

      const res = await api.get(`/admin/students/${student._id}/ledger`);
      setStudentLedger(res.data);
      setActiveTab("ledger");
    } catch (err) {
      console.error("Failed to fetch ledger", err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/50">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reporting Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Accountant-grade financial insights and audits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["7", "30", "90"].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-premium ${dateRange === range ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {range} Days
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={handlePrint} icon={Printer}>Print Report</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-fit">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "collections", label: "Collections", icon: CreditCard },
          { id: "reconciliation", label: "Reconciliation", icon: FileText },
          { id: "defaulters", label: "Defaulters", icon: AlertCircle },
          { id: "ledger", label: "Student Ledger", icon: Search }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-premium
              ${activeTab === tab.id 
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Collection Trend</h3>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Revenue over time</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => exportCSV(collectionData, "collection_trend")}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                  <Line type="monotone" dataKey="totalAmount" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Payment Modes</h3>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Transaction distribution</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => exportCSV(modeData, "payment_modes")}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="totalAmount"
                    nameKey="_id"
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 800 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Class-wise Collections</h3>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Revenue by academic level</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => exportCSV(classData, "class_wise_collections")}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                  <Bar dataKey="totalAmount" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "collections" && (
        <Card className="overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Collection Register</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">All processed payments</p>
            </div>
            <Button onClick={() => exportCSV(collectionData, "full_collection_report")} icon={Download}>Export Full CSV</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transactions</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Online</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Offline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {collectionData.map((day) => (
                  <tr key={day._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium group">
                    <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">{day._id}</td>
                    <td className="px-8 py-5 text-sm font-black text-primary">₹{day.totalAmount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">{day.count}</td>
                    <td className="px-8 py-5 text-sm font-bold text-emerald-600">₹{(day.onlineAmount || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm font-bold text-amber-600">₹{(day.offlineAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "reconciliation" && reconciliation && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Attempted</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">₹{reconciliation.summary.totalAmount.toLocaleString()}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">{reconciliation.summary.count} Transactions</p>
            </Card>
            <Card className="p-6">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Success</p>
              <h4 className="text-2xl font-black text-emerald-600">₹{reconciliation.summary.completedAmount.toLocaleString()}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">{reconciliation.summary.completedCount} Success</p>
            </Card>
            <Card className="p-6">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Total Pending</p>
              <h4 className="text-2xl font-black text-amber-600">₹{reconciliation.summary.pendingAmount.toLocaleString()}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">{reconciliation.summary.pendingCount} Pending</p>
            </Card>
            <Card className="p-6">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Total Failed</p>
              <h4 className="text-2xl font-black text-rose-600">₹{reconciliation.summary.failedAmount.toLocaleString()}</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">{reconciliation.summary.failedCount} Failed</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Audit Trail Register</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Gateway and Reference verification</p>
              </div>
              <Button onClick={() => exportCSV(reconciliation.rows, "reconciliation_report")} icon={Download}>Export Audit Logs</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode/Gateway</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reconciliation.rows.slice(0, 50).map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                      <td className="px-8 py-5 text-xs font-black text-slate-400">{row.paymentId}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">{row.student?.name}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">₹{row.amount.toLocaleString()}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase">{row.mode} / {row.gateway}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">{row.referenceNo || row.razorpayPaymentId || "-"}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          row.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                          row.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "defaulters" && (
        <Card className="overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Defaulter Aging List</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Pending and overdue students</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select 
                  className="pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 appearance-none transition-premium"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button onClick={() => exportCSV(defaulters, "defaulter_report")} icon={AlertCircle} className="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-rose-200">Export CSV</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {defaulters.map((def, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20 dark:hover:bg-rose-500/5 transition-premium">
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{def.studentName}</p>
                      <p className="text-[10px] font-bold text-slate-400">{def.registrationNo}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-slate-600 dark:text-slate-400 uppercase">{def.className}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300">{def.feeTitle}</td>
                    <td className="px-8 py-5 text-sm font-black text-rose-600">₹{def.amountDue.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      {def.daysOverdue > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                          {def.daysOverdue} Days
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "ledger" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Student Ledger Search</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Generate individual financial statements</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Enter Registration No..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-premium"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchStudentLedger(ledgerSearch)}
                  />
                </div>
                <Button onClick={() => fetchStudentLedger(ledgerSearch)} isLoading={ledgerLoading}>Generate</Button>
              </div>
            </div>
          </Card>

          {studentLedger && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 border-l-4 border-l-primary bg-white dark:bg-slate-900">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fee Amount</p>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white">₹{studentLedger.summary.totalAssigned.toLocaleString()}</h4>
                </Card>
                <Card className="p-8 border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Paid</p>
                  <h4 className="text-3xl font-black text-emerald-600">₹{studentLedger.summary.totalPaid.toLocaleString()}</h4>
                </Card>
                <Card className="p-8 border-l-4 border-l-rose-500 bg-white dark:bg-slate-900">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Balance Due</p>
                  <h4 className="text-3xl font-black text-rose-600">₹{studentLedger.summary.totalBalance.toLocaleString()}</h4>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Ledger: {studentLedger.student.name}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Academic Statement of Account ({studentLedger.student.registrationNo})</p>
                  </div>
                  <Button variant="outline" onClick={() => exportCSV(studentLedger.assignments, `ledger_${studentLedger.student.registrationNo}`)} icon={Download}>Download CSV</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Description</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentLedger.assignments.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-premium">
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{a.feeTitle}</p>
                            <p className="text-[10px] font-bold text-slate-400">{a.installmentName || "Full Payment"}</p>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">
                            {new Date(a.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">₹{a.amount.toLocaleString()}</td>
                          <td className="px-8 py-5 text-sm font-black text-emerald-600">₹{a.status === "paid" ? a.amount.toLocaleString() : 0}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              a.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                              a.status === "overdue" ? "bg-rose-100 text-rose-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
