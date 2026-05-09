import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import {
  ArrowRight,
  BadgeIndianRupee,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const fallbackContent = {
  announcement: {
    enabled: true,
    text: "Now accepting early pilot institutions for GetPay Education.",
    ctaLabel: "Start trial",
    ctaPath: "/trial"
  },
  hero: {
    eyebrow: "Fee operations for serious institutions",
    title: "Collect fees without the daily chase",
    subtitle:
      "GetPay gives schools, colleges, and coaching institutes one controlled system for fee assignment, online payments, reminders, receipts, ledgers, and owner-level visibility.",
    primaryCtaLabel: "Start 14-day trial",
    secondaryCtaLabel: "Book a demo"
  },
  contact: {
    email: "sales@getpay.in",
    phone: "+91 90000 00000"
  },
  pricingPlans: []
};

const modules = [
  {
    title: "Fee Control",
    text: "Create fee plans, assign installments, collect online or offline, and reconcile without spreadsheet drift.",
    icon: BadgeIndianRupee
  },
  {
    title: "Smart Reminders",
    text: "Schedule payment nudges for due, overdue, and partial-payment cases with campaign history.",
    icon: BellRing
  },
  {
    title: "Receipts & Ledger",
    text: "Generate branded receipts only after verified collection and keep student-wise ledgers clean.",
    icon: ReceiptText
  },
  {
    title: "SaaS Control",
    text: "Plans, modules, risk controls, billing status, trials, audits, and institution lifecycle in one owner console.",
    icon: ShieldCheck
  }
];

const proof = [
  ["30%", "less follow-up time"],
  ["10x", "faster fee visibility"],
  ["24/7", "parent payment access"],
  ["100%", "auditable actions"]
];

const SplitText = ({ text, className = "" }) => {
  const letters = useMemo(() => text.split(""), [text]);
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 42, rotateX: -80, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{
            delay: 0.018 * index,
            duration: 0.72,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ transformOrigin: "50% 80%" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

const MagneticLink = ({ to, children, className = "", variant = "primary" }) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });

  const onMouseMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.22);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    variant === "primary"
      ? "bg-[#00d26a] text-[#06120c] shadow-[0_18px_50px_rgba(0,210,106,0.34)]"
      : "border border-black/10 bg-white/80 text-[#101412] backdrop-blur-xl";

  return (
    <motion.div
      ref={ref}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      onMouseMove={reduceMotion ? undefined : onMouseMove}
      onMouseLeave={reduceMotion ? undefined : reset}
    >
      <Link
        to={to}
        className={`group inline-flex h-16 items-center justify-center gap-3 rounded-full px-8 text-sm font-black uppercase tracking-[0.16em] transition duration-500 hover:scale-[1.03] ${base} ${className}`}
      >
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
};

const ProductMockup = () => {
  const reduceMotion = useReducedMotion();
  const rows = [
    ["Class XI - Science", "Rs. 8.4L", "82%", "Due today"],
    ["B.Com Sem 2", "Rs. 5.1L", "67%", "Reminder sent"],
    ["Hostel Block A", "Rs. 2.8L", "91%", "Settled"]
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 80, rotateX: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-5xl rounded-[2.2rem] border border-white/70 bg-[#101412] p-3 shadow-[0_50px_120px_rgba(0,0,0,0.28)]"
    >
      <div className="rounded-[1.7rem] bg-[#f8fbf7] p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#ff6b57]" />
            <span className="h-3 w-3 rounded-full bg-[#ffcb45]" />
            <span className="h-3 w-3 rounded-full bg-[#00d26a]" />
          </div>
          <div className="rounded-full border border-black/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black/55">
            Live Control Room
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.35rem] border border-black/10 bg-white p-5">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">Today collected</p>
                <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-[#101412]">Rs. 12.8L</p>
              </div>
              <div className="rounded-full bg-[#00d26a]/15 px-4 py-2 text-xs font-black text-[#007d3f]">+18.4%</div>
            </div>
            <div className="flex h-52 items-end gap-2">
              {[42, 68, 45, 78, 55, 86, 72, 95, 66, 88, 61, 92].map((height, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.65 + index * 0.04, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 rounded-t-full bg-[#00d26a]"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-black/10 bg-[#fff7d7] p-5">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/50">Payment status</p>
                <WalletCards className="h-5 w-5 text-[#101412]" />
              </div>
              <div className="space-y-3">
                {rows.map(([name, value, percent, state]) => (
                  <div key={name} className="rounded-2xl bg-white/70 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-[#101412]">{name}</span>
                      <span className="text-sm font-black text-[#101412]">{value}</span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-black/10">
                      <div className="h-full rounded-full bg-[#101412]" style={{ width: percent }} />
                    </div>
                    <p className="text-xs font-bold text-black/45">{state}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Cursor = () => {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 500, damping: 40 });
  const smoothY = useSpring(y, { stiffness: 500, damping: 40 });

  useEffect(() => {
    if (reduceMotion) return undefined;
    const move = (event) => {
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [reduceMotion, x, y]);

  if (reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-8 w-8 rounded-full border border-[#00d26a]/70 mix-blend-difference lg:block"
      style={{ x: smoothX, y: smoothY }}
    />
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const [content, setContent] = useState(fallbackContent);
  const [loadError, setLoadError] = useState("");
  const heroYMotion = useTransform(scrollYProgress, [0, 0.35], [0, -170]);
  const heroScaleMotion = useTransform(scrollYProgress, [0, 0.35], [1, 0.92]);
  const bandXMotion = useTransform(scrollYProgress, [0.12, 0.62], ["0%", "-22%"]);
  const panelRotateMotion = useTransform(scrollYProgress, [0.18, 0.58], [-6, 6]);
  const heroY = reduceMotion ? 0 : heroYMotion;
  const heroScale = reduceMotion ? 1 : heroScaleMotion;
  const bandX = reduceMotion ? "0%" : bandXMotion;
  const panelRotate = reduceMotion ? 0 : panelRotateMotion;

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await api.get("/public/website-content");
        setContent({ ...fallbackContent, ...res.data });
      } catch {
        setLoadError("Website settings are offline. Showing default GetPay content.");
      }
    };

    loadContent();
  }, []);

  const visiblePlans = (content.pricingPlans || []).filter((plan) => plan.isVisible !== false);
  const recommendedPlan = visiblePlans.find((plan) => plan.isPopular) || visiblePlans[1] || visiblePlans[0];

  return (
    <main className="getpay-site min-h-screen overflow-x-hidden bg-[#f5f3e8] text-[#101412]">
      <Cursor />

      <motion.nav
        initial={reduceMotion ? false : { y: -30, opacity: 0 }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-24px)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border border-black/10 bg-[#fffdf4]/85 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl md:px-6"
      >
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#00d26a] text-lg font-black text-[#06120c]">
            G
          </span>
          <span className="text-xl font-black tracking-[-0.06em]">GetPay</span>
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {[
            ["Platform", "#platform"],
            ["Proof", "#proof"],
            ["Pricing", "#pricing"],
            ["Trust", "#trust"]
          ].map(([label, href]) => (
            <a key={label} href={href} className="text-xs font-black uppercase tracking-[0.18em] text-black/50 hover:text-black">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black/60 hover:text-black sm:block">
            Portal
          </Link>
          <Link to="/trial" className="rounded-full bg-[#101412] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white">
            Start Trial
          </Link>
        </div>
      </motion.nav>

      <section className="relative min-h-screen px-4 pb-16 pt-32 md:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ x: bandX }} className="absolute left-[-10%] top-28 flex gap-6 whitespace-nowrap text-[16vw] font-black leading-none tracking-[-0.08em] text-black/[0.035]">
            <span>REMIND</span>
            <span>COLLECT</span>
            <span>RECEIPT</span>
            <span>REPORT</span>
          </motion.div>
          <div className="absolute right-8 top-32 h-40 w-40 rounded-full border border-black/10 bg-[#00d26a]/30 blur-2xl" />
          <div className="absolute bottom-16 left-6 h-48 w-48 rounded-full border border-black/10 bg-[#ffe36e]/50 blur-3xl" />
        </div>

        <motion.div style={{ y: heroY, scale: heroScale }} className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black/55 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[#00a954]" />
              {content.hero?.eyebrow || fallbackContent.hero.eyebrow}
            </div>
            {(content.announcement?.enabled || loadError) && (
              <div className="max-w-xl rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-bold text-black/60 backdrop-blur-xl">
                {loadError || content.announcement.text}
                {!loadError && (
                  <Link to={content.announcement.ctaPath || "/trial"} className="ml-3 text-black underline underline-offset-4">
                    {content.announcement.ctaLabel || "Start trial"}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="max-w-5xl text-[16vw] font-black leading-[0.78] tracking-[-0.095em] md:text-[9.2rem] lg:text-[10.6rem]">
                <SplitText text={content.hero?.title || fallbackContent.hero.title} />
              </h1>
              <div className="mt-8 grid gap-8 md:grid-cols-[0.9fr_1fr] md:items-end">
                <p className="max-w-2xl text-lg font-semibold leading-8 text-black/62 md:text-xl">
                  {content.hero?.subtitle || fallbackContent.hero.subtitle}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <MagneticLink to="/trial">{content.hero?.primaryCtaLabel || "Start trial"}</MagneticLink>
                  <MagneticLink to="/contact?type=request_demo" variant="secondary">
                    {content.hero?.secondaryCtaLabel || "Book demo"}
                  </MagneticLink>
                </div>
              </div>
            </div>

            <motion.div
              style={{ rotate: panelRotate }}
              className="rounded-[2rem] border border-black/10 bg-[#101412] p-6 text-white shadow-[0_35px_80px_rgba(0,0,0,0.24)]"
            >
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">This month</p>
                  <p className="mt-2 text-5xl font-black tracking-[-0.08em]">Rs. 48.2L</p>
                </div>
                <div className="rounded-full bg-[#00d26a] px-4 py-2 text-xs font-black text-[#06120c]">Live</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {proof.map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-3xl font-black tracking-[-0.06em] text-[#00d26a]">{value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="mt-16">
            <ProductMockup />
          </div>
        </motion.div>
      </section>

      <section id="platform" className="relative px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-6xl font-black leading-[0.86] tracking-[-0.08em] md:text-8xl">
              Built for the fee desk and the owner cabin.
            </h2>
            <p className="max-w-md text-lg font-semibold leading-8 text-black/55">
              Institutions need speed, but they also need control. GetPay combines operational screens with Super Admin governance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 60 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group min-h-[22rem] rounded-[2rem] border border-black/10 bg-white/70 p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:bg-white"
                >
                  <div className="mb-16 grid h-14 w-14 place-items-center rounded-2xl bg-[#101412] text-[#00d26a] transition duration-500 group-hover:rotate-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-black tracking-[-0.06em]">{item.title}</h3>
                  <p className="mt-5 text-base font-semibold leading-7 text-black/55">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="overflow-hidden bg-[#101412] py-20 text-white">
        <motion.div style={{ x: bandX }} className="flex gap-8 whitespace-nowrap text-7xl font-black tracking-[-0.08em] md:text-9xl">
          {["NO SPREADSHEET CHAOS", "NO MISSED DUES", "NO RECEIPT CONFUSION"].map((item) => (
            <span key={item} className="text-white/90">
              {item} <span className="text-[#00d26a]">/</span>
            </span>
          ))}
        </motion.div>
      </section>

      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {[
            ["Assign", "Upload students, group them by class/batch, create fee plans, and assign dues in controlled batches.", Building2],
            ["Collect", "Let parents pay online while admins record verified offline payments with receipt discipline.", WalletCards],
            ["Close", "Run daily collection reports, pending dues, reconciliation, and student-wise ledgers before month-end.", FileText]
          ].map(([title, text, Icon], index) => (
            <motion.div
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 50 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2rem] border border-black/10 bg-white p-8"
            >
              <div className="mb-20 flex items-center justify-between">
                <Icon className="h-8 w-8 text-[#00a954]" />
                <span className="text-sm font-black text-black/30">0{index + 1}</span>
              </div>
              <h3 className="text-5xl font-black tracking-[-0.08em]">{title}</h3>
              <p className="mt-5 text-lg font-semibold leading-8 text-black/55">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="px-4 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 rounded-[2.5rem] bg-[#ffe36e] p-6 md:p-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-black/45">Pricing that can be controlled</p>
            <h2 className="text-6xl font-black leading-[0.86] tracking-[-0.08em] md:text-8xl">Start lean. Unlock modules as you grow.</h2>
            <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-black/60">
              Your Super Admin can control visible plans, trial availability, module access, limits, and institution lifecycle without changing code.
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#101412] p-7 text-white">
            <div className="mb-8 flex items-center justify-between">
              <span className="rounded-full bg-[#00d26a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#06120c]">
                Recommended
              </span>
              <LockKeyhole className="h-6 w-6 text-white/50" />
            </div>
            <h3 className="text-5xl font-black tracking-[-0.08em]">{recommendedPlan?.name || "Growth"}</h3>
            <p className="mt-3 min-h-12 text-base font-semibold leading-7 text-white/50">
              {recommendedPlan?.description || "For growing schools and colleges that need serious fee operations."}
            </p>
            <div className="my-9 flex items-end gap-2">
              <span className="text-7xl font-black tracking-[-0.09em]">
                {recommendedPlan?.priceInr ? `Rs. ${Number(recommendedPlan.priceInr).toLocaleString("en-IN")}` : "Custom"}
              </span>
              <span className="pb-3 text-sm font-black uppercase tracking-[0.16em] text-white/35">
                / {recommendedPlan?.billingCycle || "month"}
              </span>
            </div>
            <div className="space-y-4">
              {["Student fee plans", "Online and offline payments", "Receipts and ledgers", "Reminder campaigns", "Admin reports"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-[#00d26a]" />
                  <span className="font-bold text-white/75">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/trial" className="mt-8 flex h-16 items-center justify-center rounded-full bg-white text-sm font-black uppercase tracking-[0.18em] text-[#101412]">
              Start Trial <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="trust" className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-black/10 bg-white/70 p-8 backdrop-blur-xl md:p-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-black/35">Why institutions trust it</p>
              <h2 className="text-6xl font-black leading-[0.88] tracking-[-0.08em]">Control before scale.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Tenant isolation", "Every important record is institution scoped."],
                ["Role permissions", "Staff only sees what they are allowed to operate."],
                ["Audit trail", "Sensitive actions carry actor, time, and context."],
                ["Risk switches", "Freeze logins, exports, or collections when needed."]
              ].map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-black/10 bg-[#f5f3e8] p-6">
                  <h3 className="text-2xl font-black tracking-[-0.05em]">{title}</h3>
                  <p className="mt-3 font-semibold leading-7 text-black/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-8 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#101412] p-8 text-white md:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#00d26a] text-xl font-black text-[#06120c]">G</span>
                <span className="text-3xl font-black tracking-[-0.08em]">GetPay</span>
              </div>
              <h2 className="max-w-2xl text-5xl font-black leading-[0.9] tracking-[-0.08em] md:text-7xl">
                Ready to stop chasing fees manually?
              </h2>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <MagneticLink to="/trial">Start trial</MagneticLink>
                <MagneticLink to="/contact?type=request_demo" variant="secondary">Book demo</MagneticLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#00d26a]">Product</p>
                <div className="space-y-3">
                  <a href="#platform" className="block font-bold text-white/55 hover:text-white">Platform</a>
                  <Link to="/pricing" className="block font-bold text-white/55 hover:text-white">Pricing</Link>
                  <Link to="/trial" className="block font-bold text-white/55 hover:text-white">Start Trial</Link>
                  <Link to="/login" className="block font-bold text-white/55 hover:text-white">Portal Login</Link>
                </div>
              </div>
              <div>
                <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#00d26a]">Company</p>
                <div className="space-y-3">
                  <Link to="/contact" className="block font-bold text-white/55 hover:text-white">Contact</Link>
                  <Link to="/support" className="block font-bold text-white/55 hover:text-white">Support</Link>
                  <Link to="/terms" className="block font-bold text-white/55 hover:text-white">Terms</Link>
                  <Link to="/privacy" className="block font-bold text-white/55 hover:text-white">Privacy</Link>
                  <Link to="/refund-policy" className="block font-bold text-white/55 hover:text-white">Refund Policy</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-sm font-bold text-white/35 md:flex-row">
            <p>2026 GetPay Education. SaaS ERP for institutions.</p>
            <p>{content.contact?.email || "sales@getpay.in"} / {content.contact?.phone || "+91 90000 00000"}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
