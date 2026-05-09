import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiSave } from "react-icons/fi";
import api from "../../services/api";

const statuses = ["new", "contacted", "demo_scheduled", "trial_active", "converted", "lost"];
const sources = ["", "trial_signup", "request_demo", "contact", "support"];

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
      setMessage("Lead updated.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not update lead.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Website & sales control</p>
          <h1 className="mt-1 text-2xl font-bold">Lead & Query Inbox</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track trial signups, demo requests, contact queries, support issues, statuses, and follow-up notes.
          </p>
        </div>
        <button onClick={loadLeads} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
        </select>
        <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">
          {sources.map((source) => <option key={source || "all"} value={source}>{source ? source.replace("_", " ") : "All sources"}</option>)}
        </select>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-gray-800">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No leads found.</td></tr>
              ) : leads.map((lead) => (
                <LeadRow key={lead._id} lead={lead} onUpdate={updateLead} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LeadRow({ lead, onUpdate }) {
  const [draft, setDraft] = useState({ notes: lead.notes || "", followUpOwner: lead.followUpOwner || "" });

  return (
    <tr>
      <td className="min-w-[260px] px-4 py-4 align-top">
        <div className="font-semibold">{lead.institutionName}</div>
        <div className="text-xs text-slate-500">{lead.contactName} . {lead.contactEmail}</div>
        {lead.contactPhone && <div className="text-xs text-slate-500">{lead.contactPhone}</div>}
        {lead.message && <p className="mt-2 max-w-md text-xs leading-5 text-slate-600 dark:text-slate-300">{lead.message}</p>}
      </td>
      <td className="px-4 py-4 align-top">{lead.source?.replace("_", " ")}</td>
      <td className="px-4 py-4 align-top">
        <select value={lead.status} onChange={(e) => onUpdate(lead, { status: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950">
          {statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
        </select>
      </td>
      <td className="px-4 py-4 align-top">{lead.planInterest?.replace("_", " ") || "not sure"}</td>
      <td className="min-w-[280px] px-4 py-4 align-top">
        <input value={draft.followUpOwner} onChange={(e) => setDraft({ ...draft, followUpOwner: e.target.value })} placeholder="Follow-up owner" className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950" />
        <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows="2" placeholder="Sales/support notes" className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-950" />
        <button onClick={() => onUpdate(lead, draft)} className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">
          <FiSave className="h-3 w-3" />
          Save
        </button>
      </td>
    </tr>
  );
}
