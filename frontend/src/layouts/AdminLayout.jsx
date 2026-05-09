import { useState, useEffect, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  TrendingUp,
  Briefcase,
  History,
  Shield,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Bell,
  Search,
  ChevronRight,
  Moon,
  Sun,
  School
} from "lucide-react";
import { AuthContext } from "../context/authContextValue";
import { ThemeContext } from "../context/themeContextValue";
import api from "../services/api";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [enabledModules, setEnabledModules] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const { user, logout, stopImpersonation } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  useEffect(() => {
    const loadInstitutionData = async () => {
      try {
        const res = await api.get("/admin/institution");
        setInstitution(res.data);
        setEnabledModules(res.data.enabledModules || []);
        setUserPermissions(res.data.userPermissions || []);
      } catch (err) {
        console.error("Failed to load layout data", err);
      }
    };
    loadInstitutionData();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Students', href: '/admin/students', icon: Users, module: 'student_management', permission: 'student.view' },
    { name: 'Manage Fees', href: '/admin/fees', icon: CreditCard, module: 'fee_management', permission: 'fee.view' },
    { name: 'Manage Payments', href: '/admin/payments', icon: BarChart3, module: 'finance_operations', permission: 'fee.collect' },
    { name: 'Finance Workspace', href: '/admin/finance', icon: Briefcase, module: 'finance_operations', permission: 'fee.collect' },
    { name: 'Reminder Campaigns', href: '/admin/reminder-campaigns', icon: History, module: 'finance_operations', permission: 'fee.collect' },
    { name: 'Audit Trail', href: '/admin/audit-trail', icon: Shield, module: 'audit_trail', permission: 'settings.manage' },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp, module: 'analytics', permission: 'analytics.view' },
    { name: 'Reports', href: '/admin/reports', icon: FileText, module: 'finance_operations', permission: 'report.export' },
    { name: 'Staff & Roles', href: '/admin/staff', icon: UserCheck, module: 'settings', permission: 'staff.manage' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, module: 'settings', permission: 'settings.manage' },
  ].filter((item) => {
    const moduleAllowed = !item.module || enabledModules.length === 0 || enabledModules.includes(item.module);
    const permissionAllowed = user?.role === 'admin' || userPermissions.includes('*') || !item.permission || userPermissions.includes(item.permission);
    return moduleAllowed && permissionAllowed;
  });

  const getBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return path.map((p, i) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '),
      href: '/' + path.slice(0, i + 1).join('/')
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {user?.impersonated && (
        <div className="fixed left-0 right-0 top-0 z-[70] flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950">
          <span>Support mode: impersonating {user.email}. Reason: {user.impersonationReason}</span>
          <button onClick={stopImpersonation} className="rounded bg-amber-950 px-3 py-1 text-xs text-white">
            Return to Super Admin
          </button>
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col
        ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-primary/20' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">GetPay</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-black mt-1">Admin HQ</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-premium group
                  ${active 
                    ? 'bg-primary text-white shadow-md shadow-primary/25' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary'}
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-premium'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar User Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center text-slate-500 font-black text-xs">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-premium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-72">
        {/* Top Header */}
        <header className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2.5 rounded-xl text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-premium"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Clickable Breadcrumbs */}
            <nav className="hidden sm:flex items-center text-[10px] font-black uppercase tracking-widest">
              <Link to="/admin/dashboard" className="text-slate-400 hover:text-primary transition-premium">HQ</Link>
              {getBreadcrumbs().map((crumb, i) => (
                <div key={crumb.href} className="flex items-center">
                  <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
                  <Link 
                    to={crumb.href}
                    className={i === getBreadcrumbs().length - 1 ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-primary transition-premium"}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Search (Visual Only for now) */}
            <div className="hidden lg:flex items-center relative group">
              <Search className="w-4 h-4 absolute left-4 text-slate-400 group-focus-within:text-primary transition-premium" />
              <input 
                type="text" 
                placeholder="Global search command..." 
                className="pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold w-64 focus:ring-2 focus:ring-primary/20 transition-premium placeholder:text-slate-400"
              />
            </div>

            {/* Notifications */}
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-premium">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-premium border border-slate-100 dark:border-slate-700"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Content Area with Fade In */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-top-2 duration-700">
            <Outlet context={{ institution }} />
          </div>
        </main>
      </div>
    </div>
  );
}
