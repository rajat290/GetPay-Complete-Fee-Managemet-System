import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="group relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-premium overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-premium" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-premium">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  </motion.div>
);

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary selection:text-white overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 bg-grain" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 px-8 py-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-display font-black text-xl">G</span>
            </div>
            <span className="font-display font-black text-2xl tracking-tighter uppercase">GetPay</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Solutions", "Pricing", "About"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-400 hover:text-white transition-premium tracking-wide">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-premium">
              Log in
            </Link>
            <Link to="/trial">
              <Button className="rounded-2xl px-8 h-12 bg-white text-slate-900 hover:bg-slate-100 border-none font-black shadow-xl shadow-white/5">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8">
              <Sparkles className="w-3 h-3" /> Next-Gen Institutional ERP
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight leading-[0.9] mb-8">
              Trust is <span className="text-primary italic">Automated.</span> <br />
              Revenue is <span className="text-glow">Secured.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12">
              Transform your institution with GetPay. From automated fee recovery to accountant-grade financial audits, we handle the operations so you can focus on education.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/trial">
                <Button className="rounded-2xl px-10 h-16 bg-primary text-white hover:bg-primary-dark border-none font-black text-lg shadow-2xl shadow-primary/40 group">
                  Build Your Institution <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-premium" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-2xl px-10 h-16 border-white/10 text-white hover:bg-white/5 font-black text-lg">
                View Interactive Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            style={{ y }}
            className="mt-24 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
            <div className="relative rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-4 md:p-8 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="Dashboard Preview" 
                className="rounded-[2rem] w-full shadow-2xl opacity-80 group-hover:opacity-100 transition-premium duration-1000 grayscale group-hover:grayscale-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Active Institutions", value: "500+" },
            { label: "Fees Processed", value: "₹250Cr+" },
            { label: "Trust Score", value: "99.9%" },
            { label: "Recovery Rate", value: "85%" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl md:text-5xl font-display font-black text-white mb-2">{stat.value}</p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6">Designed for <span className="text-primary">Clarity.</span></h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto uppercase tracking-widest text-xs">A unified command center for institutional excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck}
              title="Audit Resilience"
              description="Every action, every transaction, every modification. A permanent, cryptographically-safe audit trail for absolute transparency."
              delay={0.1}
            />
            <FeatureCard 
              icon={Zap}
              title="Lightning Recovery"
              description="Automated reminder campaigns across WhatsApp, SMS, and Email. Reduce payment friction with one-click payment links."
              delay={0.2}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Analytical Precision"
              description="Accountant-grade financial reporting. Daily summaries, class-wise performance, and student-wise ledger analysis."
              delay={0.3}
            />
            <FeatureCard 
              icon={Users}
              title="Role-Based Security"
              description="Granular permissions for staff, accountants, and principals. Ensure every user has the right access, at the right time."
              delay={0.4}
            />
            <FeatureCard 
              icon={CreditCard}
              title="Modern Payments"
              description="Native Razorpay integration. Support for Netbanking, UPI, Cards, and automated installment tracking."
              delay={0.5}
            />
            <FeatureCard 
              icon={Globe}
              title="Multi-Tenant SaaS"
              description="Scalable infrastructure that grows with you. Manage multiple branches and sessions from a single dashboard."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6">Transparent <span className="text-primary">SaaS Plans.</span></h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto uppercase tracking-widest text-xs">Scale your institution without the overhead</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Starter", 
                price: "₹4,999", 
                desc: "For small academies", 
                features: ["Up to 200 Students", "Core Fee Management", "Email Notifications", "Basic Reports"] 
              },
              { 
                name: "Growth", 
                price: "₹14,999", 
                popular: true,
                desc: "For growing schools", 
                features: ["Up to 1000 Students", "Advanced Analytics", "WhatsApp Reminders", "Installment Plans", "Staff RBAC"] 
              },
              { 
                name: "Enterprise", 
                price: "Custom", 
                desc: "For large institutions", 
                features: ["Unlimited Students", "Multi-Branch Support", "Priority Support", "Custom Integrations", "Full White-labeling"] 
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? 'bg-white text-slate-900 border-primary shadow-2xl shadow-primary/20' : 'bg-white/5 border-white/10 text-white'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-display font-black mb-2 uppercase tracking-tighter">{plan.name}</h3>
                <p className={`text-sm mb-8 font-bold ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-display font-black">{plan.price}</span>
                  <span className="text-sm font-bold opacity-50">/month</span>
                </div>
                <div className="space-y-4 mb-10">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <ShieldCheck className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-primary'}`} />
                      <span className="text-sm font-bold tracking-tight">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/trial">
                  <Button className={`w-full h-14 rounded-2xl font-black ${plan.popular ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-primary to-indigo-900 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute inset-0 bg-grain opacity-10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-tight mb-8">
              The Future of Institutional <br /> Management is Here.
            </h2>
            <p className="text-primary-foreground/80 font-medium text-lg max-w-xl mx-auto mb-12">
              Join 500+ institutions who have already upgraded their financial operations with GetPay.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/trial">
                <Button className="bg-white text-primary hover:bg-slate-50 px-10 h-16 rounded-2xl font-black text-lg border-none">
                  Get Started Now
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:bg-white/10 px-10 h-16 rounded-2xl font-black text-lg">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-display font-black text-sm">G</span>
              </div>
              <span className="font-display font-black text-xl tracking-tighter uppercase">GetPay</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              Leading the digital transformation of educational institutional finance across India. Secure, Scalable, and Trusted.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { title: "Product", links: ["Features", "Security", "Pricing", "API"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Terms", "Privacy", "Security", "SLA"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-premium">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-600">© 2026 GetPay SaaS ERP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-600 hover:text-white transition-premium"><Globe className="w-4 h-4" /></a>
            <a href="#" className="text-slate-600 hover:text-white transition-premium font-black text-xs uppercase tracking-widest">Twitter</a>
            <a href="#" className="text-slate-600 hover:text-white transition-premium font-black text-xs uppercase tracking-widest">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
