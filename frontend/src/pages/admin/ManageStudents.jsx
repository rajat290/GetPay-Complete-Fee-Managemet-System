import { useState } from "react";
import { UserPlus, Mail, Fingerprint, Users as UsersIcon, Link as LinkIcon, Plus, FileText, Upload, AlertCircle, CheckCircle2, Download } from "lucide-react";
import api from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import DataTable from "../../components/common/DataTable";

export default function ManageStudents() {
  const [inviteMode, setInviteMode] = useState(true);
  const [inviteUrl, setInviteUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    registrationNo: "", 
    className: "" 
  });
  const [message, setMessage] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [classOptions] = useState([
    "12thA", "12thB", "11thA", "11thB", "10thA", "10thB", 
    "9thA", "9thB", "8thA", "8thB", "7thA", "7thB"
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);
    setInviteUrl("");
    setIsAdding(true);
    try {
      const res = inviteMode
        ? await api.post("/admin/students/invite", form)
        : await api.post("/admin/students", form);

      setMessage({
        type: "success",
        text: inviteMode ? "Student invited successfully!" : "Student added successfully!"
      });
      
      if (res.data.inviteUrl) {
        setInviteUrl(res.data.inviteUrl);
      }
      setForm({ name: "", email: "", registrationNo: "", className: "" });
      // Refresh table logic would go here if we had a ref to loadData, 
      // but DataTable handles its own loading. For now, a manual refresh or state sync is needed.
      // In a real app, I'd use React Query or a similar hook.
      window.location.reload(); // Quick fix for now to sync the list
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Error adding student"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    
    setIsImporting(true);
    setImportSummary(null);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await api.post("/admin/students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImportSummary(res.data);
      setMessage({ type: "success", text: res.data.message });
      setImportFile(null);
      // Refresh logic
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Error importing students"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Registration No,Class\nJohn Doe,john@example.com,REG001,12thA";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStudents = async (params) => {
    const res = await api.get("/admin/students", { params });
    return res.data;
  };

  const columns = [
    { 
      header: "Student", 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: "Registration No", accessor: "registrationNo" },
    { 
      header: "Class", 
      render: (row) => (
        <Badge variant="info">{row.className}</Badge>
      )
    },
    { 
      header: "Status", 
      render: (row) => (
        <Badge variant={row.status === "inactive" ? "warning" : "success"}>
          {row.status === "inactive" ? "Invited" : "Active"}
        </Badge>
      )
    },
    {
      header: "Actions",
      render: (row) => (
        <Button variant="ghost" size="sm">Edit</Button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Onboard and manage your institution's student records.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-rose-50 text-rose-800 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
        }`}>
          <div className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Add Student Form Card */}
      <Card 
        title={inviteMode ? "Invite Student" : "Add New Student"}
        subtitle={inviteMode ? "Send an activation link for self-service signup." : "Manually create a student account."}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invite Mode</span>
            <button 
              onClick={() => setInviteMode(!inviteMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-premium ${inviteMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-premium ${inviteMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        }
      >
        <form onSubmit={handleAdd} className="space-y-6">
          {inviteUrl && (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase flex items-center gap-1 mb-1">
                <LinkIcon className="w-3 h-3" /> Development Invite Link
              </p>
              <a href={inviteUrl} className="text-xs text-blue-600 dark:text-blue-400 underline break-all font-medium">
                {inviteUrl}
              </a>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Input 
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input 
              label="Email Address"
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input 
              label="Registration No"
              name="registrationNo"
              placeholder="REG123"
              value={form.registrationNo}
              onChange={handleChange}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Class
              </label>
              <select
                name="className"
                value={form.className}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-premium h-[38px] px-3"
              >
                <option value="">Select Class</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              type="submit" 
              isLoading={isAdding}
              icon={inviteMode ? Mail : UserPlus}
            >
              {inviteMode ? "Send Invitation" : "Create Account"}
            </Button>
          </div>
        </form>
      </Card>

      </Card>

      {/* CSV Import Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Student Directory" noPadding>
            <DataTable 
              columns={columns}
              fetchData={fetchStudents}
              searchPlaceholder="Search by name, email, or registration..."
            />
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card 
            title="Bulk Onboarding" 
            subtitle="Import students via CSV file"
            action={
              <Button variant="ghost" size="sm" icon={Download} onClick={downloadTemplate}>
                Template
              </Button>
            }
          >
            <form onSubmit={handleImport} className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-premium ${
                  importFile ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) setImportFile(e.dataTransfer.files[0]);
                }}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${importFile ? "text-primary" : "text-slate-400"}`} />
                {importFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{importFile.name}</p>
                    <p className="text-xs text-slate-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                    <button 
                      type="button"
                      onClick={() => setImportFile(null)}
                      className="text-xs text-rose-500 font-bold hover:underline mt-2"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Click or drag CSV here</p>
                    <p className="text-xs text-slate-500 font-medium">Only .csv files are supported</p>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label 
                      htmlFor="csv-upload"
                      className="inline-block mt-4 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary transition-premium"
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>

              {importSummary && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Import Summary</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-center">
                      <p className="text-xl font-black text-emerald-500">{importSummary.summary.successCount}</p>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Success</p>
                    </div>
                    <div className="p-2 bg-rose-500/5 rounded-lg border border-rose-500/10 text-center">
                      <p className="text-xl font-black text-rose-500">{importSummary.summary.validationErrorCount + importSummary.summary.duplicateErrorCount}</p>
                      <p className="text-[10px] font-bold text-rose-600/70 uppercase">Failed</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                icon={FileText}
                disabled={!importFile}
                isLoading={isImporting}
              >
                Process Import
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
