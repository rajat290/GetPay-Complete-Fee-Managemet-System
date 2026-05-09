import { useState, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ChevronRight, 
  ArrowRight,
  Globe,
  Lock,
  PieChart,
  Users,
  CreditCard,
  MessageSquare,
  Sparkles,
  Search,
  Play,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const FeatureCard = ({ icon: Icon, title, description, delay, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
    className={`group relative p-10 bg-white border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-premium overflow-hidden rounded-[2.5rem] ${className}`}
  >
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:rotate-6 transition-premium">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-2xl font-display font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium text-lg">{description}</p>
    </div>
  </motion.div>
);

export default function Landing() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-[#F0F4F4] text-slate-900 selection:bg-primary selection:text-white overflow-x-hidden font-sans">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-grain opacity-[0.03]" />
      </div>

      {/* Floating Pill Navigation */}
      <div className="fixed top-8 w-full z-50 flex justify-center px-6">
        <motion.nav 
          animate={{ 
            width: isScrolled ? "90%" : "100%",
            maxWidth: isScrolled ? "800px" : "1200px",
            y: isScrolled ? 0 : 0
          }}
          className="flex items-center justify-between backdrop-blur-2xl bg-white/80 border border-white shadow-2xl shadow-black/5 px-8 py-4 rounded-[2rem] transition-all duration-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-display font-black text-xl text-white">G</span>
            </div>
            <span className="font-display font-black text-2xl tracking-tighter uppercase text-slate-900">GetPay</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {["Platform", "Solutions", "Enterprise", "Pricing"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black text-slate-500 hover:text-primary transition-premium uppercase tracking-widest">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-black text-slate-500 hover:text-slate-900 transition-premium uppercase tracking-widest">
              Portal
            </Link>
            <Link to="/trial">
              <Button className="rounded-2xl px-8 h-12 bg-primary text-white hover:bg-primary-dark border-none font-black shadow-xl shadow-primary/20 transition-premium hover:scale-105 active:scale-95">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm shadow-primary/5">
                <Sparkles className="w-3 h-3" /> The Modern Standard for Education
              </span>
              <h1 className="text-7xl md:text-8xl font-display font-black tracking-tighter leading-[0.85] mb-10 text-slate-900">
                Institutional Trust. <br />
                <span className="text-primary italic">Perfectly</span> Handled.
              </h1>
              <p className="max-w-xl text-xl text-slate-500 font-medium leading-relaxed mb-12">
                GetPay is the premium ERP architecture designed to secure institutional revenue, automate recovery, and provide absolute financial transparency.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link to="/trial">
                  <Button className="rounded-[1.5rem] px-12 h-20 bg-primary text-white hover:bg-primary-dark border-none font-black text-xl shadow-2xl shadow-primary/40 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Launch Your Trial <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-premium" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-premium group">
                    <Play className="w-5 h-5 text-primary fill-primary group-hover:scale-110 transition-premium" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">Watch Product Tour</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-20 pt-10 border-t border-slate-200 flex items-center gap-10">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">
                  Trusted by <span className="text-slate-900">500+</span> Academic Leaders
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative perspective-1000"
            >
              <div className="relative rounded-[4rem] bg-white p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-[3rem] blur-2xl animate-float" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-[3rem] blur-3xl animate-float-slow" />
                
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bbda3865c170?auto=format&fit=crop&q=80&w=2426" 
                  alt="Interface" 
                  className="rounded-[3rem] shadow-sm group-hover:scale-[1.02] transition-premium duration-1000"
                />

                {/* Floating Widget */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-20 -right-12 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[200px]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recovery</span>
                  </div>
                  <div className="text-2xl font-display font-black text-emerald-600">+85%</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Efficiency Boost</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="solutions" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-display font-black mb-8 tracking-tighter">Everything to run your <br /> <span className="text-primary italic">Empire.</span></h2>
            <div className="w-24 h-2 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              className="md:col-span-2 md:row-span-1"
              icon={BarChart3}
              title="Predictive Recovery Dashboard"
              description="Stop chasing payments. Our AI-driven engine predicts collection trends and identifies at-risk dues before they become defaulters. Experience a 40% reduction in late payments within 60 days."
              delay={0.1}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Immutable Audits"
              description="Accountability is built-in. Every modification is tracked with cryptographic precision."
              delay={0.2}
            />
            <FeatureCard 
              icon={Zap}
              title="Hyper-Automation"
              description="One-click reminder campaigns across WhatsApp, SMS, and Email."
              delay={0.3}
            />
            <FeatureCard 
              className="md:col-span-2"
              icon={Globe}
              title="Multi-Branch Synergy"
              description="Scale from one branch to one hundred without breaking a sweat. Unified data models ensure that your administrative workflows remain identical across your entire institutional network."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Slider */}
      <section className="py-20 border-y border-slate-200 bg-white overflow-hidden">
        <div className="flex animate-in slide-in-from-left duration-1000 opacity-50 whitespace-nowrap gap-20 items-center justify-center px-10 grayscale">
          {["OXFORD", "CAMBRIDGE", "STANFORD", "HARVARD", "MIT", "IIT", "BITS"].map(name => (
            <span key={name} className="text-3xl font-display font-black text-slate-300 tracking-[0.5em]">{name}</span>
          ))}
        </div>
      </section>

      {/* Pricing - The 'Cofee' Style */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-display font-black mb-8 tracking-tight">Transparent <span className="text-primary">pricing</span> <br /> that grows with you.</h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                No hidden setup fees. No complex contracts. Start small, scale fast.
              </p>
              <ul className="space-y-6">
                {[
                  "14-Day Free Trial on all plans",
                  "Cancel or switch plans anytime",
                  "Enterprise-grade security included",
                  "Dedicated Relationship Manager"
                ].map(item => (
                  <li key={item} className="flex items-center gap-4 text-slate-600 font-bold">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 -mr-20 -mt-20 rounded-full blur-3xl transition-premium group-hover:scale-150" />
              <div className="relative z-10">
                <span className="px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Recommended</span>
                <h3 className="text-3xl font-display font-black mb-2 tracking-tight uppercase">Growth Plan</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-display font-black text-slate-900">₹14,999</span>
                  <span className="text-lg font-bold text-slate-400">/mo</span>
                </div>
                <div className="space-y-6 mb-12">
                  {[
                    "Up to 1,000 Active Students",
                    "Unlimited Reminder Campaigns",
                    "Full Reporting Suite & Audits",
                    "Multi-part Installments Support",
                    "Custom Branded Receipts"
                  ].map(f => (
                    <div key={f} className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-slate-600 font-bold tracking-tight">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/trial">
                  <Button className="w-full h-20 rounded-[2rem] bg-primary text-white hover:bg-primary-dark border-none font-black text-xl shadow-xl shadow-primary/20 transition-premium">
                    Get Started Free
                  </Button>
                </Link>
                <p className="text-center mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Pill */}
      <footer className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3.5rem] p-16 md:p-24 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="font-display font-black text-xl text-white">G</span>
                </div>
                <span className="font-display font-black text-2xl tracking-tighter uppercase text-white">GetPay</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg">
                The institution of the future isn't just paperless; it's frictionless. Secure your legacy with GetPay.
              </p>
              <div className="flex gap-4">
                {["Twitter", "LinkedIn", "Instagram"].map(social => (
                  <a key={social} href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-premium">
                    <span className="sr-only">{social}</span>
                    <Globe className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
              {[
                { title: "SaaS", links: ["Features", "Security", "Pricing", "Enterprise"] },
                { title: "Company", links: ["About", "Blog", "SLA", "Privacy"] }
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8">{col.title}</h4>
                  <ul className="space-y-4">
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-slate-400 font-bold hover:text-white transition-premium">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 GetPay SaaS ERP. Designed for Excellence.</p>
            <div className="flex gap-10">
              <a href="#" className="text-slate-500 hover:text-white transition-premium text-xs font-black uppercase tracking-[0.2em]">Contact Support</a>
              <a href="#" className="text-slate-500 hover:text-white transition-premium text-xs font-black uppercase tracking-[0.2em]">Status: Online</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
