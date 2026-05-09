import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Phone } from "lucide-react";
import Button from "../components/common/Button";
import api from "../services/api";

const initialForm = {
  institutionName: "",
  institutionType: "school",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  planInterest: "not_sure",
  message: ""
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get("type");
  const source = requestedType === "request_demo" ? "request_demo" : "contact";
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (
    source === "request_demo" ? "Request a GetPay demo" : "Contact GetPay"
  ), [source]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await api.post("/public/leads", {
        ...form,
        source,
        subject: source === "request_demo" ? "Demo request" : "Website contact"
      });
      setForm(initialForm);
      setStatus({ type: "success", text: "Your query has been received. The GetPay team can now track it from Super Admin." });
    } catch (error) {
      setStatus({ type: "error", text: error.response?.data?.error || "Could not submit your query. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-black">GetPay Education</Link>
          <Link to="/pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-700">Pricing</Link>
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">Sales & support</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Tell us about your institution. Demo, contact, and support requests now become trackable leads inside the Super Admin panel.
          </p>
          <div className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-blue-700" /> sales@getpay.in</p>
            <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-blue-700" /> +91 90000 00000</p>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Institution name" value={form.institutionName} onChange={(value) => setForm({ ...form, institutionName: value })} required />
            <label className="block text-sm font-semibold text-slate-700">
              Institution type
              <select value={form.institutionType} onChange={(e) => setForm({ ...form, institutionType: e.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="coaching">Coaching</option>
                <option value="other">Other</option>
              </select>
            </label>
            <Input label="Contact name" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} required />
            <Input label="Email" type="email" value={form.contactEmail} onChange={(value) => setForm({ ...form, contactEmail: value })} required />
            <Input label="Phone" value={form.contactPhone} onChange={(value) => setForm({ ...form, contactPhone: value })} />
            <label className="block text-sm font-semibold text-slate-700">
              Plan interest
              <select value={form.planInterest} onChange={(e) => setForm({ ...form, planInterest: e.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="not_sure">Not sure</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Message
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="5" required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>

          {status.text && (
            <div className={`mt-4 rounded-md border px-4 py-3 text-sm ${status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
              {status.text}
            </div>
          )}

          <Button disabled={loading} className="mt-6 h-12 w-full rounded-lg bg-blue-700 hover:bg-blue-800">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Query"}
          </Button>
        </form>
      </main>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" />
    </label>
  );
}
