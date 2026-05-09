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
  Rocket,
  ShieldCheck
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
    <div className="min-h-screen bg-[#F0F4F4] text-slate-900 selection:bg-primary flex items-center justify-center p-6 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[100px]" />
        <div className="absolute inset-0 bg-grain opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-display font-black text-sm text-white">G</span>
            </div>
            <span className="font-display font-black text-xl tracking-tighter uppercase text-slate-900">GetPay</span>
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tight mb-3 text-slate-900">Launch Your <span className="text-primary italic">Free Trial.</span></h1>
          <p className="text-slate-500 font-medium tracking-wide">Join 500+ institutions transforming their operations today.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
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
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Institutional Identity</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Institution Name"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Type</label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 focus:bg-white focus:border-primary outline-none transition-premium font-black text-slate-500 uppercase tracking-widest text-xs"
                          >
                            <option value="school">School</option>
                            <option value="college">College</option>
                            <option value="coaching">Coaching</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Phone Number"
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Billing Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@institution.com"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-4">{error}</p>}

                      <Button 
                        type="button"
                        onClick={handleNext}
                        className="w-full h-16 rounded-2xl bg-primary text-white hover:bg-primary-dark font-black text-lg group border-none shadow-xl shadow-primary/20 transition-premium"
                      >
                        Next: Administrator <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-premium" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Login Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleChange}
                            placeholder="personal@email.com"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="password"
                            name="adminPassword"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            placeholder="••••••••••••"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-premium font-bold text-slate-700"
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-4">{error}</p>}

                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="button"
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-400 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px]"
                        >
                          <ArrowLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                        <Button 
                          type="submit"
                          disabled={loading}
                          className="flex-[2] h-16 rounded-2xl bg-primary text-white hover:bg-primary-dark font-black text-lg border-none shadow-2xl shadow-primary/40 transition-premium"
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
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-black mb-4 text-slate-900">Trial Activated!</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  Welcome aboard, <span className="text-slate-900 font-black">{formData.name}</span>. <br />
                  We are initializing your workspace. <br />
                  Redirecting to your dashboard...
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <Rocket className="w-3 h-3 animate-bounce" /> Sequence Initialized
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
          Institutional Login? <Link to="/login" className="text-slate-900 hover:text-primary transition-premium underline underline-offset-4">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
