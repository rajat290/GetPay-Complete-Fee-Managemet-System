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
    <div className="flex min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Left Panel: Aesthetic Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-700 to-indigo-900" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full -mr-96 -mt-96 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-dark/20 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <School className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">GetPay</span>
          </div>

          <div className="max-w-md space-y-8 animate-in fade-in slide-in-from-top-2 duration-1000">
            <h2 className="text-5xl font-black text-white leading-tight">
              The Next Gen <br />
              <span className="text-indigo-200">Education Hub.</span>
            </h2>
            <p className="text-lg text-indigo-100 font-medium leading-relaxed opacity-90">
              Streamline financial operations, manage student lifecycles, and gain deep institutional insights with our premium ERP.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
                <p className="text-sm font-bold text-white">Bank-grade Security</p>
                <p className="text-xs text-indigo-200">AES-256 encrypted ledger.</p>
              </div>
              <div className="space-y-2">
                <Zap className="w-6 h-6 text-indigo-300" />
                <p className="text-sm font-bold text-white">Real-time Sync</p>
                <p className="text-xs text-indigo-200">Zero lag payment tracking.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-indigo-100">Trusted by 200+ Institutions</p>
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
