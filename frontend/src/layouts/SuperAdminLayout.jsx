import { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  Home, 
  Briefcase, 
  Inbox, 
  Globe, 
  MessageSquare, 
  Shield, 
  LogOut, 
  Activity,
  ChevronRight
} from "lucide-react";
import { AuthContext } from "../context/authContextValue";

const navigation = [
  { name: "Overview", href: "/super-admin/dashboard", icon: Home },
  { name: "Organizations", href: "/super-admin/institutions", icon: Briefcase },
  { name: "Leads & Queries", href: "/super-admin/leads", icon: Inbox },
  { name: "Website Manager", href: "/super-admin/website", icon: Globe },
  { name: "Communications", href: "/super-admin/communications", icon: MessageSquare }
];

export default function SuperAdminLayout() {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans text-surface-900 dark:bg-slate-950 dark:text-white transition-colors duration-500">
      {/* Sidebar */}
      <aside className="hidden w-80 border-r border-surface-200 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 lg:block fixed h-full z-50">
        <div className="border-b border-surface-200 p-8 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-900 text-primary shadow-xl shadow-primary/10 dark:bg-white dark:text-slate-900">
              <Shield className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-xl font-black tracking-tight">Control Tower</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-surface-900/50 dark:text-slate-400">Platform Active</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                  active
                    ? "bg-surface-900 text-white shadow-xl shadow-surface-900/10 dark:bg-white dark:text-slate-900"
                    : "text-surface-900/60 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-surface-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary' : ''}`} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.name}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-surface-200 p-8 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
              {user?.name?.charAt(0) || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black tracking-tight">{user?.name || "Platform Owner"}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-primary">Root Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-surface-200 bg-white py-3.5 text-sm font-black text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80">
        {/* Top Header for Content */}
        <header className="h-20 flex items-center justify-between px-8 bg-surface-50/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-surface-900/40 dark:text-slate-500">
            <span>SaaS Hub</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-surface-900 dark:text-white">Live Operations</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 shadow-sm">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black text-surface-900/70 dark:text-slate-300 tracking-wider uppercase">System Stable</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
