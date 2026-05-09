import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { PublicCta, PublicSiteShell } from "../components/public/PublicSiteShell";

const titles = {
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/refund-policy": "Refund Policy",
  "/support": "Support"
};

const slugs = {
  "/terms": "terms",
  "/privacy": "privacy",
  "/refund-policy": "refund-policy",
  "/support": "support"
};

export default function LegalPage() {
  const location = useLocation();
  const slug = useMemo(() => slugs[location.pathname] || "terms", [location.pathname]);
  const [page, setPage] = useState({ title: titles[location.pathname] || "Legal", content: "Loading..." });
  const [contact, setContact] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      setError("");
      try {
        const [pageRes, contentRes] = await Promise.all([
          api.get(`/public/legal/${slug}`),
          api.get("/public/website-content")
        ]);
        setPage(pageRes.data);
        setContact(contentRes.data?.contact || {});
      } catch (err) {
        setError(err.response?.data?.error || "Could not load this page.");
        setPage({ title: titles[location.pathname] || "Legal", content: "This page is being prepared." });
      }
    };

    loadPage();
  }, [location.pathname, slug]);

  return (
    <PublicSiteShell contact={contact}>
      <main className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="h-fit rounded-[2.5rem] bg-[#101412] p-8 text-white lg:sticky lg:top-28">
            <FileText className="mb-16 h-10 w-10 text-[#00d26a]" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00d26a]">GetPay policies</p>
            <h1 className="mt-5 text-6xl font-black leading-[0.86] tracking-[-0.08em]">{page.title}</h1>
            <p className="mt-6 font-semibold leading-7 text-white/55">Public policy content is managed from the Super Admin website manager.</p>
            <div className="mt-8 space-y-3 text-sm font-bold text-white/45">
              <PolicyLink to="/terms" label="Terms" />
              <PolicyLink to="/privacy" label="Privacy" />
              <PolicyLink to="/refund-policy" label="Refund Policy" />
              <PolicyLink to="/support" label="Support" />
            </div>
          </aside>

          <section>
            {error && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">{error}</div>}
            <article className="rounded-[2.5rem] border border-black/10 bg-white/85 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.08)] md:p-10">
              <div className="mb-10 flex items-center justify-between gap-4 border-b border-black/10 pb-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">Last reviewed</p>
                  <p className="mt-1 font-black">{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("en-IN") : "Policy draft"}</p>
                </div>
                <ShieldCheck className="h-9 w-9 text-[#00a954]" />
              </div>
              <div className="prose max-w-none whitespace-pre-line text-base font-semibold leading-8 text-black/65">
                {page.content}
              </div>
            </article>

            <div className="mt-6 rounded-[2rem] bg-[#ffe36e] p-7">
              <h2 className="text-4xl font-black tracking-[-0.07em]">Need clarification?</h2>
              <p className="mt-3 max-w-2xl font-semibold leading-7 text-black/60">Send a query and it will land in the Super Admin lead and support inbox.</p>
              <div className="mt-6">
                <PublicCta to="/contact" variant="dark">Contact Support</PublicCta>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PublicSiteShell>
  );
}

function PolicyLink({ to, label }) {
  return (
    <Link to={to} className="block rounded-2xl border border-white/10 px-4 py-3 hover:bg-white/10 hover:text-white">
      {label}
    </Link>
  );
}
