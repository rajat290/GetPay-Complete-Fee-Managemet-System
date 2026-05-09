import { Link } from "react-router-dom";
import { Compass, Home, LogIn } from "lucide-react";
import { PublicCta, PublicSiteShell } from "../components/public/PublicSiteShell";

export default function NotFound() {
  return (
    <PublicSiteShell>
      <main className="px-4 py-20 md:px-8 md:py-28">
        <section className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2.5rem] bg-[#101412] p-8 text-white md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#00d26a]">
              <Compass className="h-4 w-4" />
              404
            </p>
            <h1 className="text-7xl font-black leading-[0.82] tracking-[-0.09em] md:text-9xl">This route does not exist.</h1>
            <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-white/58">
              The page may have moved, or the link may be incomplete. Use the public site or portal entry points below.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PublicCta to="/" variant="green">Go Home</PublicCta>
              <PublicCta to="/login">Portal Login</PublicCta>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
            <div className="mb-20 grid h-16 w-16 place-items-center rounded-3xl bg-[#00d26a] text-[#06120c]">
              <Home className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-black tracking-[-0.07em]">Useful paths</h2>
            <div className="mt-6 grid gap-3 text-sm font-bold text-white/65">
              <Link to="/pricing" className="rounded-2xl bg-white/[0.06] px-4 py-3 hover:bg-white/[0.1]">Pricing</Link>
              <Link to="/trial" className="rounded-2xl bg-white/[0.06] px-4 py-3 hover:bg-white/[0.1]">Start trial</Link>
              <Link to="/contact" className="rounded-2xl bg-white/[0.06] px-4 py-3 hover:bg-white/[0.1]">Contact</Link>
              <Link to="/login" className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-3 hover:bg-white/[0.1]">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
