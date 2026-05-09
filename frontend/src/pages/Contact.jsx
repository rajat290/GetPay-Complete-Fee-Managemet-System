import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Loader2, Mail, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import Button from "../components/common/Button";
import api from "../services/api";
import { PublicSiteShell } from "../components/public/PublicSiteShell";

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
  const [contact, setContact] = useState({ email: "sales@getpay.in", phone: "+91 90000 00000" });

  useEffect(() => {
    const loadContact = async () => {
      try {
        const res = await api.get("/public/website-content");
        setContact({ ...contact, ...(res.data?.contact || {}) });
      } catch {
        setStatus({ type: "info", text: "Live website settings are unavailable. You can still submit the form." });
      }
    };

    loadContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(() => (
    source === "request_demo" ? "Book a serious GetPay demo" : "Talk to the GetPay team"
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
      setStatus({ type: "success", text: "Your query is in the Super Admin lead inbox. We will follow up soon." });
    } catch (error) {
      setStatus({ type: "error", text: error.response?.data?.error || "Could not submit your query. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicSiteShell contact={contact}>
      <main className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-[#101412] p-8 text-white md:p-10">
            <div className="absolute -right-10 top-8 text-[9rem] font-black leading-none tracking-[-0.08em] text-white/[0.04]">CALL</div>
            <div className="relative">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#00d26a]">
                <MessageSquare className="h-4 w-4" />
                Sales and support
              </p>
              <h1 className="text-6xl font-black leading-[0.85] tracking-[-0.08em] md:text-8xl">{title}</h1>
              <p className="mt-7 text-lg font-semibold leading-8 text-white/58">
                Demo requests, trial questions, and support queries become trackable leads for the Super Admin team.
              </p>

              <div className="mt-10 grid gap-4">
                <ContactLine icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
                <ContactLine icon={Phone} label="Phone" value={contact.phone} href={`tel:${String(contact.phone || "").replace(/\s/g, "")}`} />
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Demo", "Workflow walkthrough"],
                  ["Trial", "14-day setup"],
                  ["Support", "Tracked query"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-2xl font-black tracking-[-0.06em] text-[#00d26a]">{label}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/40">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <form onSubmit={submit} className="rounded-[2.5rem] border border-black/10 bg-white/80 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)] md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">Lead intake</p>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.07em]">Institution details</h2>
              </div>
              <ShieldCheck className="h-9 w-9 text-[#00a954]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Institution name" value={form.institutionName} onChange={(value) => setForm({ ...form, institutionName: value })} required />
              <Select label="Institution type" value={form.institutionType} onChange={(value) => setForm({ ...form, institutionType: value })} options={[
                ["school", "School"],
                ["college", "College"],
                ["coaching", "Coaching"],
                ["other", "Other"]
              ]} />
              <Input label="Contact name" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} required />
              <Input label="Email" type="email" value={form.contactEmail} onChange={(value) => setForm({ ...form, contactEmail: value })} required />
              <Input label="Phone" value={form.contactPhone} onChange={(value) => setForm({ ...form, contactPhone: value })} />
              <Select label="Plan interest" value={form.planInterest} onChange={(value) => setForm({ ...form, planInterest: value })} options={[
                ["not_sure", "Not sure"],
                ["starter", "Starter"],
                ["growth", "Growth"],
                ["enterprise", "Enterprise"]
              ]} />
            </div>

            <label className="mt-4 block text-sm font-black uppercase tracking-[0.12em] text-black/45">
              Message
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows="5"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f8fbf7] px-4 py-3 text-base font-semibold normal-case tracking-normal text-[#101412] outline-none focus:border-[#00d26a]"
              />
            </label>

            {status.text && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : status.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
              }`}>
                {status.text}
              </div>
            )}

            <Button disabled={loading} className="mt-6 h-14 w-full rounded-full bg-[#101412] text-white hover:bg-black">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Query"}
            </Button>
          </form>
        </div>
      </main>
    </PublicSiteShell>
  );
}

function ContactLine({ icon: Icon, label, value, href }) {
  return (
    <a href={href} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/[0.1]">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#00d26a] text-[#06120c]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-xs font-black uppercase tracking-[0.18em] text-white/35">{label}</span>
        <span className="mt-1 block font-black text-white">{value}</span>
      </span>
    </a>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block text-sm font-black uppercase tracking-[0.12em] text-black/45">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f8fbf7] px-4 text-base font-semibold normal-case tracking-normal text-[#101412] outline-none focus:border-[#00d26a]"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-black uppercase tracking-[0.12em] text-black/45">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f8fbf7] px-4 text-base font-semibold normal-case tracking-normal text-[#101412] outline-none focus:border-[#00d26a]"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}
