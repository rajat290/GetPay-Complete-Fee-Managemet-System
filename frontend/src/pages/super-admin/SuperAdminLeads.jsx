import { useCallback, useEffect, useState } from "react";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  MessageSquare, 
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const statuses = ["new", "contacted", "demo_scheduled", "trial_active", "converted", "lost"];
const sources = ["", "trial_signup", "request_demo", "contact", "support"];

const statusColors = {
  new: "bg-blue-500 text-white",
  contacted: "bg-indigo-500 text-white",
  demo_scheduled: "bg-amber-500 text-white",
  trial_active: "bg-primary text-white",
  converted: "bg-emerald-500 text-white",
  lost: "bg-rose-500 text-white"
};

export default function SuperAdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ status: "", source: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.source) params.set("source", filters.source);
      const res = await api.get(`/super-admin/leads?${params.toString()}`);
      setLeads(res.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [filters.source, filters.status]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const updateLead = async (lead, patch) => {
    setMessage("");
    try {
      const res = await api.patch(`/super-admin/leads/${lead._id}`, patch);
      setLeads((current) => current.map((item) => (item._id === lead._id ? res.data : item)));
      setMessage("Interaction recorded.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Update failed.");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="px-8 space-y-12">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-reveal">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            <Inbox className="h-4 w-4" />
            Growth Pipeline
          </p>
          <h1 className="font-display text-4xl font-black text-surface-900 dark:text-white tracking-tight">
            Leads & <span className="text-primary italic">Queries.</span>
          </h1>
          <p className="mt-4 text-lg text-surface-900/60 dark:text-slate-400 max-w-xl font-medium leading-relaxed">
            Manage the transition from public interest to institutional onboarding.
          </p>
        </div>

        <button onClick={loadLeads} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 transition-all hover:bg-surface-50 shadow-sm">
          <RefreshCw className={`h-5 w-5 text-surface-900/40 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </section>

      {/* Filters Bar */}
      <section className="glass-card !rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 flex items-center gap-4 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-900/20" />
            <input placeholder="Search entities..." className="w-full bg-surface-50 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>
          <div className="h-10 w-[1px] bg-surface-100 hidden md:block dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-surface-900/20" />
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-surface-900/60 outline-none"
            >
              <option value="">Status: All</option>
              {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-bold text-primary flex items-center gap-3 backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5" />
          {message}
        </div>
      )}

      {/* Leads List */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {loading && leads.length === 0 ? (
          <div className="py-20 text-center font-bold text-surface-900/20">Syncing CRM Core...</div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center font-bold text-surface-900/20">Pipeline is empty.</div>
        ) : leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} onUpdate={updateLead} />
        ))}
      </motion.div>
    </div>
  );
}

function LeadCard({ lead, onUpdate }) {
  const [draft, setDraft] = useState({ notes: lead.notes || "", followUpOwner: lead.followUpOwner || "" });
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="glass-card !rounded-3xl p-8 group transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        {/* Entity Info */}
        <div className="flex-1 flex gap-6 items-start">
          <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-slate-800 flex items-center justify-center text-surface-900/20 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display text-xl font-black tracking-tight">{lead.institutionName}</h3>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[lead.status] || 'bg-surface-200'}`}>
                {lead.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2 text-xs font-bold text-surface-900/40 dark:text-slate-500">
                <User size={14} className="text-primary" /> {lead.contactName}
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-surface-900/40 dark:text-slate-500">
                <Mail size={14} className="text-primary" /> {lead.contactEmail}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                Source: {lead.source?.replace("_", " ") || "Organic"}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Plan */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/20 mb-1">Interest Tier</p>
            <p className="font-bold text-sm uppercase text-primary">{lead.planInterest || "Not Defined"}</p>
          </div>
          
          <select 
            value={lead.status} 
            onChange={(e) => onUpdate(lead, { status: e.target.value })}
            className="bg-surface-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none transition-all focus:ring-2 focus:ring-primary/20"
          >
            {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-3 rounded-xl bg-surface-900 text-white transition-all ${isExpanded ? 'rotate-180' : ''}`}
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 mt-8 border-t border-surface-100 dark:border-slate-800 grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Requirement Notes</p>
                <div className="p-6 rounded-2xl bg-surface-50 dark:bg-slate-800/50 border border-surface-100 dark:border-slate-800 italic text-sm text-surface-900/60 leading-relaxed font-medium">
                  {lead.message || "No detailed message provided by the lead."}
                </div>
                {lead.contactPhone && (
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Phone size={16} className="text-primary" />
                    {lead.contactPhone}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sales Follow-up</p>
                <div className="space-y-3">
                  <input 
                    value={draft.followUpOwner} 
                    onChange={(e) => setDraft({ ...draft, followUpOwner: e.target.value })}
                    placeholder="Owner (e.g. Sales Team Alpha)"
                    className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea 
                    value={draft.notes} 
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    rows="3"
                    placeholder="Record interaction notes..."
                    className="w-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <button 
                    onClick={() => onUpdate(lead, draft)}
                    className="flex w-full items-center justify-center gap-2 bg-surface-900 text-white dark:bg-white dark:text-slate-900 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Save size={14} />
                    Commit Interaction
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
        <MessageSquare size={120} className="-mr-12 -mt-12" />
      </div>
    </motion.div>
  );
}
