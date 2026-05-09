import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeIndianRupee, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import api from "../services/api";
import { PublicCta, PublicSiteShell } from "../components/public/PublicSiteShell";

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
    isVisible: true,
    trialEnabled: false
  }
];

export default function Pricing() {
  const [plans, setPlans] = useState(fallbackPlans);
  const [contact, setContact] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await api.get("/public/website-content");
        const visible = (res.data?.pricingPlans || []).filter((plan) => plan.isVisible !== false);
        if (visible.length) setPlans(visible);
        setContact(res.data?.contact || {});
      } catch {
        setMessage("Live pricing settings are unavailable. Showing default GetPay plans.");
      }
    };

    loadPricing();
  }, []);

  return (
    <PublicSiteShell contact={contact}>
      <main>
        <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28">
          <div className="absolute left-[-10%] top-8 text-[17vw] font-black leading-none tracking-[-0.08em] text-black/[0.035]">PRICE</div>
          <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1fr_0.78fr]">
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black/55">
                <Sparkles className="h-4 w-4 text-[#00a954]" />
                Pricing controlled from Super Admin
              </div>
              <h1 className="max-w-5xl text-7xl font-black leading-[0.82] tracking-[-0.085em] md:text-9xl">
                Pick the plan. Unlock the modules.
              </h1>
              <p className="mt-8 max-w-2xl text-lg font-semibold leading-8 text-black/60">
                Start with a trial, then activate the institution with the right student limits, reminder limits, and module access. Plans are visible to buyers, but enforcement stays inside your platform control tower.
              </p>
            </div>

            <div className="relative rounded-[2rem] border border-black/10 bg-[#101412] p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
              <div className="mb-16 flex items-center justify-between">
                <BadgeIndianRupee className="h-9 w-9 text-[#00d26a]" />
                <span className="rounded-full bg-[#00d26a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#06120c]">14-day trial</span>
              </div>
              <p className="text-5xl font-black tracking-[-0.08em]">Manual sales today. Automated billing ready tomorrow.</p>
              <p className="mt-5 font-semibold leading-7 text-white/55">Designed for early pilots where you still want commercial control.</p>
            </div>
          </div>
        </section>

        {message && (
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="rounded-2xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm font-bold text-amber-900">{message}</div>
          </div>
        )}

        <section className="px-4 pb-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.key || plan.name}
                className={`relative flex min-h-[34rem] flex-col rounded-[2rem] border p-7 transition duration-500 hover:-translate-y-1 ${
                  plan.isPopular
                    ? "border-[#00d26a] bg-[#101412] text-white shadow-[0_35px_100px_rgba(0,0,0,0.22)]"
                    : "border-black/10 bg-white/75 text-[#101412]"
                }`}
              >
                {plan.isPopular && <p className="mb-5 w-fit rounded-full bg-[#00d26a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#06120c]">Most Chosen</p>}
                <h2 className="text-5xl font-black tracking-[-0.08em]">{plan.name}</h2>
                <p className={`mt-4 min-h-20 font-semibold leading-7 ${plan.isPopular ? "text-white/55" : "text-black/55"}`}>{plan.description}</p>
                <div className="my-8 flex items-end gap-2">
                  <span className="text-6xl font-black tracking-[-0.09em]">
                    {plan.priceInr ? `Rs. ${Number(plan.priceInr).toLocaleString("en-IN")}` : "Custom"}
                  </span>
                  <span className={`pb-2 text-xs font-black uppercase tracking-[0.16em] ${plan.isPopular ? "text-white/35" : "text-black/35"}`}>/{plan.billingCycle || "month"}</span>
                </div>
                <ul className="space-y-3">
                  {(plan.features || []).map((feature) => (
                    <li key={feature} className={`flex gap-3 text-sm font-bold ${plan.isPopular ? "text-white/75" : "text-black/65"}`}>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00d26a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.trialEnabled === false ? "/contact?type=request_demo" : "/trial"}
                  className={`mt-auto flex h-14 items-center justify-center rounded-full text-xs font-black uppercase tracking-[0.16em] ${
                    plan.isPopular ? "bg-white text-[#101412]" : "bg-[#101412] text-white"
                  }`}
                >
                  {plan.trialEnabled === false ? "Talk to Sales" : "Start Trial"}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] bg-[#ffe36e] p-8">
              <ShieldCheck className="mb-16 h-10 w-10" />
              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.08em]">Limits are not just text on a pricing page.</h2>
              <p className="mt-6 font-semibold leading-7 text-black/60">Student seats, reminder campaigns, modules, trial status, and risk controls are enforced from backend logic.</p>
            </div>
            <div className="rounded-[2rem] border border-black/10 bg-white/75 p-8">
              <LockKeyhole className="mb-16 h-10 w-10 text-[#00a954]" />
              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.08em]">Need a custom institution deal?</h2>
              <p className="mt-6 max-w-2xl font-semibold leading-7 text-black/60">Use Enterprise for multi-branch schools, custom onboarding, or pilot pricing. Every query lands in your Super Admin lead inbox.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PublicCta to="/contact?type=request_demo" variant="green">Request Demo</PublicCta>
                <PublicCta to="/trial">Start Trial</PublicCta>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
