import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function PublicSiteShell({ children, contact }) {
  return (
    <div className="getpay-site min-h-screen overflow-x-hidden bg-[#f5f3e8] text-[#101412]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fffdf4]/85 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#00d26a] text-lg font-black text-[#06120c]">G</span>
            <span className="text-xl font-black tracking-[-0.06em]">GetPay</span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em]">
            <Link to="/pricing" className="hidden text-black/50 hover:text-black sm:block">Pricing</Link>
            <Link to="/contact" className="hidden text-black/50 hover:text-black sm:block">Contact</Link>
            <Link to="/login" className="text-black/50 hover:text-black">Portal</Link>
            <Link to="/trial" className="rounded-full bg-[#101412] px-5 py-3 text-white">Start Trial</Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="px-4 pb-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-[2rem] bg-[#101412] p-7 text-sm font-bold text-white/45 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-black tracking-[-0.07em] text-white">GetPay Education</p>
            <p className="mt-2">SaaS ERP for institutional fee operations.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-white">Refund</Link>
            <Link to="/support" className="hover:text-white">Support</Link>
          </div>
          <p>{contact?.email || "sales@getpay.in"} / {contact?.phone || "+91 90000 00000"}</p>
        </div>
      </footer>
    </div>
  );
}

export function PublicCta({ to, children, variant = "dark", className = "" }) {
  const styles = variant === "green"
    ? "bg-[#00d26a] text-[#06120c] shadow-[0_18px_50px_rgba(0,210,106,0.26)]"
    : "bg-[#101412] text-white";

  return (
    <Link
      to={to}
      className={`inline-flex h-14 items-center justify-center gap-3 rounded-full px-7 text-xs font-black uppercase tracking-[0.16em] transition duration-500 hover:-translate-y-0.5 ${styles} ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
