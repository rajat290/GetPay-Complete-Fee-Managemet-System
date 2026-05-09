import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import api from "../../services/api";

const emptyContent = {
  announcement: { enabled: false, text: "", ctaLabel: "Start trial", ctaPath: "/trial" },
  hero: { eyebrow: "", title: "", subtitle: "", primaryCtaLabel: "", secondaryCtaLabel: "" },
  contact: { email: "", phone: "", address: "" },
  pricingPlans: [],
  faqs: []
};

export default function SuperAdminWebsite() {
  const [content, setContent] = useState(emptyContent);
  const [legalPages, setLegalPages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [websiteRes, legalRes] = await Promise.all([
        api.get("/super-admin/website-content"),
        api.get("/super-admin/legal-pages")
      ]);
      setContent({ ...emptyContent, ...websiteRes.data });
      setLegalPages(legalRes.data || []);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not load website manager.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveWebsite = async () => {
    setMessage("");
    try {
      const res = await api.patch("/super-admin/website-content", content);
      setContent({ ...emptyContent, ...res.data });
      setMessage("Website content updated.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not save website content.");
    }
  };

  const saveLegal = async (page) => {
    setMessage("");
    try {
      const res = await api.put(`/super-admin/legal-pages/${page.slug}`, page);
      setLegalPages((current) => {
        const exists = current.some((item) => item.slug === page.slug);
        return exists ? current.map((item) => (item.slug === page.slug ? res.data : item)) : [...current, res.data];
      });
      setMessage(`${res.data.title} updated.`);
    } catch (error) {
      setMessage(error.response?.data?.error || "Could not save legal page.");
    }
  };

  const updatePlan = (index, patch) => {
    const next = [...(content.pricingPlans || [])];
    next[index] = { ...next[index], ...patch };
    setContent({ ...content, pricingPlans: next });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Website & sales control</p>
        <h1 className="mt-1 text-2xl font-bold">Website, Pricing & Legal Manager</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Manage public hero copy, announcement banner, contact information, pricing display, and legal pages.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-gray-800 dark:bg-gray-900">Loading website manager...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <Card title="Announcement Banner">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input type="checkbox" checked={content.announcement?.enabled || false} onChange={(e) => setContent({ ...content, announcement: { ...content.announcement, enabled: e.target.checked } })} />
                Show announcement on public website
              </label>
              <Input label="Text" value={content.announcement?.text || ""} onChange={(value) => setContent({ ...content, announcement: { ...content.announcement, text: value } })} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="CTA label" value={content.announcement?.ctaLabel || ""} onChange={(value) => setContent({ ...content, announcement: { ...content.announcement, ctaLabel: value } })} />
                <Input label="CTA path" value={content.announcement?.ctaPath || ""} onChange={(value) => setContent({ ...content, announcement: { ...content.announcement, ctaPath: value } })} />
              </div>
            </Card>

            <Card title="Hero Content">
              {["eyebrow", "title", "subtitle", "primaryCtaLabel", "secondaryCtaLabel"].map((field) => (
                <Input key={field} label={field} value={content.hero?.[field] || ""} onChange={(value) => setContent({ ...content, hero: { ...content.hero, [field]: value } })} />
              ))}
            </Card>

            <Card title="Pricing Display">
              <div className="space-y-4">
                {(content.pricingPlans || []).map((plan, index) => (
                  <div key={plan.key || index} className="rounded-md border border-slate-200 p-4 dark:border-gray-800">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input label="Name" value={plan.name || ""} onChange={(value) => updatePlan(index, { name: value })} />
                      <Input label="Price INR" type="number" value={plan.priceInr || 0} onChange={(value) => updatePlan(index, { priceInr: Number(value) })} />
                    </div>
                    <Input label="Description" value={plan.description || ""} onChange={(value) => updatePlan(index, { description: value })} />
                    <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                      <label><input type="checkbox" checked={plan.isVisible !== false} onChange={(e) => updatePlan(index, { isVisible: e.target.checked })} /> Visible</label>
                      <label><input type="checkbox" checked={plan.isPopular || false} onChange={(e) => updatePlan(index, { isPopular: e.target.checked })} /> Popular</label>
                      <label><input type="checkbox" checked={plan.trialEnabled !== false} onChange={(e) => updatePlan(index, { trialEnabled: e.target.checked })} /> Trial enabled</label>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <button onClick={saveWebsite} className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              <FiSave className="h-4 w-4" />
              Save Website Content
            </button>
          </section>

          <section className="space-y-6">
            <Card title="Contact Information">
              <Input label="Email" value={content.contact?.email || ""} onChange={(value) => setContent({ ...content, contact: { ...content.contact, email: value } })} />
              <Input label="Phone" value={content.contact?.phone || ""} onChange={(value) => setContent({ ...content, contact: { ...content.contact, phone: value } })} />
              <Input label="Address" value={content.contact?.address || ""} onChange={(value) => setContent({ ...content, contact: { ...content.contact, address: value } })} />
            </Card>

            <Card title="Legal Pages">
              {["terms", "privacy", "refund-policy", "support"].map((slug) => {
                const page = legalPages.find((item) => item.slug === slug) || { slug, title: slug, content: "", status: "published" };
                return (
                  <LegalEditor
                    key={slug}
                    page={page}
                    onChange={(next) => setLegalPages((current) => {
                      const exists = current.some((item) => item.slug === slug);
                      return exists ? current.map((item) => (item.slug === slug ? next : item)) : [...current, next];
                    })}
                    onSave={saveLegal}
                  />
                );
              })}
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
    </label>
  );
}

function LegalEditor({ page, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-gray-800">
      <Input label="Title" value={page.title || ""} onChange={(value) => onChange({ ...page, title: value })} />
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        Content
        <textarea value={page.content || ""} onChange={(e) => onChange({ ...page, content: e.target.value })} rows="5" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950" />
      </label>
      <button onClick={() => onSave(page)} className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
        Save {page.slug}
      </button>
    </div>
  );
}
