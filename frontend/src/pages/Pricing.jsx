import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquare } from "lucide-react";
import Button from "../components/common/Button";
import api from "../services/api";

const fallbackPlans = [
  {
    key: "starter",
    name: "Starter",
    priceInr: 4999,
    billingCycle: "month",
    description: "For small schools and coaching centers starting online collections.",
    features: ["Up to 500 students", "Fee collection", "Receipts", "Basic reminders"],
    isVisible: true
  },
  {
    key: "growth",
    name: "Growth",
    priceInr: 14999,
    billingCycle: "month",
    description: "For institutions that need reporting, reminders, and stronger controls.",
    features: ["Up to 1,000 students", "Unlimited reminders", "Advanced reports", "Audit trail"],
    isVisible: true,
    isPopular: true
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceInr: 0,
    billingCycle: "custom",
    description: "For multi-branch institutions and custom operating needs.",
    features: ["Custom limits", "Priority support", "Advanced controls", "Custom onboarding"],
    isVisible: true
  }
];

export default function Pricing() {
  const [plans, setPlans] = useState(fallbackPlans);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await api.get("/public/website-content");
        const visible = (res.data?.pricingPlans || []).filter((plan) => plan.isVisible !== false);
        if (visible.length) setPlans(visible);
      } catch {
        setMessage("Live pricing settings are unavailable. Showing default plans.");
      }
    };

    loadPricing();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">Pricing</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Plans for every institution stage.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Start with a 14-day trial, then move to a plan that matches your student volume and reporting needs.
          </p>
        </div>

        {message && <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>}

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.key} className={`rounded-lg border bg-white p-6 shadow-sm ${plan.isPopular ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"}`}>
              {plan.isPopular && <p className="mb-4 inline-flex rounded-full bg-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Popular</p>}
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{plan.description}</p>
              <p className="mt-6 text-4xl font-black">
                {plan.priceInr ? `₹${Number(plan.priceInr).toLocaleString("en-IN")}` : "Custom"}
                <span className="text-sm font-semibold text-slate-500">/{plan.billingCycle || "month"}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {(plan.features || []).map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={plan.trialEnabled === false ? "/contact?type=request_demo" : "/trial"} className="mt-8 block">
                <Button fullWidth className="h-12 rounded-lg bg-blue-700 hover:bg-blue-800">
                  {plan.trialEnabled === false ? "Talk to Sales" : "Start Trial"}
                </Button>
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Need help choosing?</h2>
              <p className="mt-1 text-sm text-slate-600">Your query will go into the Super Admin lead inbox for follow-up.</p>
            </div>
            <Link to="/contact?type=request_demo">
              <Button variant="secondary" icon={MessageSquare}>Request Demo</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-black">GetPay Education</Link>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link to="/contact" className="text-slate-600 hover:text-blue-700">Contact</Link>
          <Link to="/login" className="text-slate-600 hover:text-blue-700">Login</Link>
          <Link to="/trial"><Button className="bg-blue-700 hover:bg-blue-800">Start Trial</Button></Link>
        </div>
      </nav>
    </header>
  );
}
