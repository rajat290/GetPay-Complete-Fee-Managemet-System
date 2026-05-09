import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

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
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      setError("");
      try {
        const res = await api.get(`/public/legal/${slug}`);
        setPage(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load this page.");
        setPage({ title: titles[location.pathname] || "Legal", content: "This page is being prepared." });
      }
    };

    loadPage();
  }, [location.pathname, slug]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-black">GetPay Education</Link>
          <Link to="/contact" className="text-sm font-semibold text-slate-600 hover:text-blue-700">Contact</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-sm font-black uppercase tracking-widest text-blue-700">GetPay policies</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{page.title}</h1>
        {error && <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
        <article className="mt-8 whitespace-pre-line rounded-lg border border-slate-200 bg-white p-6 leading-8 text-slate-700 shadow-sm">
          {page.content}
        </article>
      </main>
    </div>
  );
}
