import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  Rocket
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import axios from "axios";

export default function TrialSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "school",
    email: "",
    phone: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      setError("Please fill in basic institutional details");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/public/register-trial", formData);
      if (res.data.success) {
        setSuccess(true);
        // After 3 seconds, redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary flex items-center justify-center p-6 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute inset-0 bg-grain" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-display font-black text-sm">G</span>
            </div>
            <span className="font-display font-black text-xl tracking-tighter uppercase">GetPay</span>
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tight mb-3">Launch Your <span className="text-primary italic">Free Trial.</span></h1>
          <p className="text-slate-400 font-medium tracking-wide">Join 500+ institutions transforming their operations today.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Institutional Identity</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Institution Name (e.g., Global Academy)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Type</label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:border-primary outline-none transition-premium font-black text-slate-400 uppercase tracking-widest text-xs"
                          >
                            <option value="school" className="bg-slate-900">School</option>
                            <option value="college" className="bg-slate-900">College</option>
                            <option value="coaching" className="bg-slate-900">Coaching</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Contact Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="99999-XXXXX"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Billing Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@institution.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest text-center mt-4">{error}</p>}

                      <Button 
                        type="button"
                        onClick={handleNext}
                        className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg group border-none shadow-xl shadow-white/5"
                      >
                        Next: Admin Setup <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-premium" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Admin Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="text"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleChange}
                            placeholder="Principal or IT Manager Name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Login Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="email"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleChange}
                            placeholder="your.personal@email.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="password"
                            name="adminPassword"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-premium font-bold text-slate-200"
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest text-center mt-4">{error}</p>}

                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="button"
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1 h-14 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                        >
                          <ArrowLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                        <Button 
                          type="submit"
                          disabled={loading}
                          className="flex-[2] h-14 rounded-2xl bg-primary text-white hover:bg-primary-dark font-black text-lg border-none shadow-2xl shadow-primary/40"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Complete Setup"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-display font-black mb-4">You're All Set!</h2>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                  Welcome to GetPay, <span className="text-white font-black">{formData.name}</span>. <br />
                  Your 14-day growth trial has been activated. <br />
                  Redirecting to your dashboard...
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <Rocket className="w-3 h-3 animate-bounce" /> Initialization Sequence Active
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-white hover:text-primary transition-premium underline underline-offset-4">Log in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
