import { useState } from "react";
import { UserPlus, Mail, Fingerprint, Users as UsersIcon, Link as LinkIcon, Plus } from "lucide-react";
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

      {/* Students List Table */}
      <Card title="Student Directory" noPadding>
        <DataTable 
          columns={columns}
          fetchData={fetchStudents}
          searchPlaceholder="Search by name, email, or registration..."
        />
      </Card>
    </div>
  );
}
