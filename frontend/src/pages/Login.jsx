import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  School, 
  Lock, 
  Mail, 
  Hash, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/authContextValue";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [institutionCode, setInstitutionCode] = useState("GETPAY-DEMO");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, institutionCode });
      login(res.data, res.data.token);

      if (res.data.mustChangePassword) {
        navigate("/change-password");
      } else if (res.data.role === "super_admin") {
        navigate("/super-admin/dashboard");
      } else if (res.data.role === "admin" || res.data.role === "staff") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Dynamic Background Elements for overall feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Panel: Aesthetic Sidebar */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Abstract Background Image */}
        <img 
          src="/premium_edu_dashboard_abstract_1778329981304.png" 
          alt="Premium Education Background" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 via-primary/40 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
        
        {/* Floating Glass Cards for depth */}
        <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 rotate-12 animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-24 h-24 bg-indigo-500/10 backdrop-blur-lg rounded-2xl border border-white/10 -rotate-12 animate-float pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <School className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight leading-none">GetPay</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.2em] mt-1">Enterprise ERP</span>
            </div>
          </div>

          <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
                <Zap className="w-3 h-3 text-yellow-400" />
                Now with AI Insights
              </div>
              <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                Empower your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">Institutional Vision.</span>
              </h2>
            </div>
            <p className="text-xl text-indigo-50 font-medium leading-relaxed opacity-80 max-w-lg">
              The definitive platform for managing financial lifecycles, student data, and operational excellence in education.
            </p>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Secure Ledger</p>
                  <p className="text-[10px] text-indigo-200 font-medium">Bank-grade safety</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  <Globe className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Global Access</p>
                  <p className="text-[10px] text-indigo-200 font-medium">Cloud native power</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between animate-in fade-in duration-1000 delay-700">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-indigo-100">Joining 2,400+ Administrators today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-10 animate-in fade-in duration-1000">
          <div className="text-center lg:text-left space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your credentials to access the HQ.</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in shake duration-500">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Code</label>
              <Input
                icon={Hash}
                placeholder="e.g. GETPAY-DEMO"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                required
                className="h-12 text-sm font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <Input
                icon={Mail}
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-sm font-bold"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <Input
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-sm font-bold pr-12"
              />
              <button
                type="button"
                className="absolute bottom-3 right-4 text-slate-400 hover:text-primary transition-premium"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-premium" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-premium">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              icon={ArrowRight}
              className="h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline transition-premium ml-1">
                Contact Administration
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 opacity-20">
            <Globe className="w-5 h-5 text-slate-400" />
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <Zap className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
