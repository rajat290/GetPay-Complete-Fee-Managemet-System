import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  ShieldCheck,
  Users
} from "lucide-react";
import Button from "../components/common/Button";
import api from "../services/api";

const fallbackContent = {
  announcement: { enabled: false, text: "", ctaLabel: "Start trial", ctaPath: "/trial" },
  hero: {
    eyebrow: "The modern standard for education finance",
    title: "GetPay Education",
    subtitle: "Institution-grade fee collection, receipts, reminders, and reporting for schools, colleges, and coaching institutes.",
    primaryCtaLabel: "Start 14-day trial",
    secondaryCtaLabel: "Request demo"
  },
  contact: {
    email: "sales@getpay.in",
    phone: "+91 90000 00000"
  },
  pricingPlans: []
};

const modules = [
  { icon: BadgeIndianRupee, title: "Fee Collection", text: "Collect online and offline payments with verified receipts and payment history." },
  { icon: Users, title: "Student Operations", text: "Import students, assign fees, track dues, and manage institution-level workflows." },
  { icon: BarChart3, title: "Reports & Reconciliation", text: "Daily collections, dues, defaulters, ledgers, and gateway reconciliation." },
  { icon: ShieldCheck, title: "Controls & Audit", text: "Tenant isolation, RBAC, module access, billing lifecycle, and audit trails." }
];

export default function Landing() {
  const [content, setContent] = useState(fallbackContent);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await api.get("/public/website-content");
        setContent({ ...fallbackContent, ...res.data });
      } catch {
        setLoadError("Live website settings are unavailable. Showing default product information.");
      }
    };

    loadContent();
  }, []);

  const visiblePlans = (content.pricingPlans || []).filter((plan) => plan.isVisible !== false);
  const growthPlan = visiblePlans.find((plan) => plan.isPopular) || visiblePlans[1] || visiblePlans[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 font-black text-white">G</span>
            <span className="text-xl font-black tracking-tight">GetPay Education</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#platform" className="hover:text-blue-700">Platform</a>
            <Link to="/pricing" className="hover:text-blue-700">Pricing</Link>
            <Link to="/contact?type=request_demo" className="hover:text-blue-700">Request Demo</Link>
            <Link to="/privacy" className="hover:text-blue-700">Privacy</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-slate-600 hover:text-slate-950 sm:inline">Login</Link>
            <Link to="/trial">
              <Button className="rounded-lg bg-blue-700 hover:bg-blue-800">Start Trial</Button>
            </Link>
          </div>
        </nav>
      </header>

      {content.announcement?.enabled && (
        <div className="border-b border-blue-200 bg-blue-50 px-6 py-3 text-center text-sm font-semibold text-blue-800">
          {content.announcement.text}
          <Link to={content.announcement.ctaPath || "/trial"} className="ml-3 underline underline-offset-4">
            {content.announcement.ctaLabel || "Start trial"}
          </Link>
        </div>
      )}

      {loadError && (
        <div className="mx-auto mt-4 max-w-7xl px-6">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div>
        </div>
      )}

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
              <Lock className="h-4 w-4" />
              {content.hero?.eyebrow}
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              {content.hero?.title || "GetPay Education"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {content.hero?.subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/trial">
                <Button className="h-14 rounded-lg bg-blue-700 px-7 text-base font-bold hover:bg-blue-800">
                  {content.hero?.primaryCtaLabel || "Start 14-day trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact?type=request_demo">
                <Button variant="secondary" className="h-14 rounded-lg px-7 text-base font-bold">
                  {content.hero?.secondaryCtaLabel || "Request demo"}
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid gap-4 text-sm font-semibold text-slate-700 sm:grid-cols-3">
              {["Tenant-safe SaaS", "Razorpay-ready payments", "Audit-backed operations"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="rounded-lg bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Today</p>
                  <p className="mt-1 text-2xl font-black">Collections Control</p>
                </div>
                <BadgeIndianRupee className="h-10 w-10 text-blue-300" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Collected", "₹8.4L"],
                  ["Pending Dues", "₹2.1L"],
                  ["Receipts", "1,248"],
                  ["Reminders", "6 campaigns"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-300">{label}</p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {growthPlan && (
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700">Popular plan</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">{growthPlan.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{growthPlan.description}</p>
                  </div>
                  <p className="text-right text-2xl font-black text-blue-700">
                    {growthPlan.priceInr ? `₹${Number(growthPlan.priceInr).toLocaleString("en-IN")}` : "Custom"}
                    <span className="block text-xs font-bold text-slate-500">/{growthPlan.billingCycle || "month"}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="platform" className="border-y border-slate-200 bg-white px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-widest text-blue-700">Platform modules</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">Built for institutions that handle money every day.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {modules.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <Icon className="h-8 w-8 text-blue-700" />
                  <h3 className="mt-5 text-lg font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">Ready for a walkthrough?</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Turn website visitors into tracked Super Admin leads.</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              Demo requests, trial signups, and support queries now feed the platform owner console instead of disappearing into inactive website controls.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5">
            <Link to="/contact?type=request_demo">
              <Button fullWidth className="h-12 rounded-lg bg-blue-700 hover:bg-blue-800" icon={MessageSquare}>Request Demo</Button>
            </Link>
            <Link to="/pricing">
              <Button fullWidth variant="secondary" className="h-12 rounded-lg" icon={FileText}>View Pricing</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 px-6 py-12 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xl font-black text-white">GetPay Education</p>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Enterprise-grade fee management SaaS for schools, colleges, and coaching institutions.
            </p>
            <p className="mt-4 text-sm">
              <a href={`mailto:${content.contact?.email || "sales@getpay.in"}`} className="hover:text-white">{content.contact?.email}</a>
              <span className="mx-2">.</span>
              <a href={`tel:${(content.contact?.phone || "").replace(/\s/g, "")}`} className="hover:text-white">{content.contact?.phone}</a>
            </p>
          </div>
          <FooterColumn title="Product" links={[
            ["Platform", "/#platform"],
            ["Pricing", "/pricing"],
            ["Start Trial", "/trial"],
            ["Request Demo", "/contact?type=request_demo"]
          ]} />
          <FooterColumn title="Trust" links={[
            ["Contact", "/contact"],
            ["Support", "/support"],
            ["Terms", "/terms"],
            ["Privacy", "/privacy"],
            ["Refund Policy", "/refund-policy"]
          ]} />
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-500">
          Copyright 2026 GetPay SaaS ERP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
