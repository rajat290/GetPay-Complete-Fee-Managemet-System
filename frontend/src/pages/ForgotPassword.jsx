import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import api from "../services/api";

export default function ForgotPassword() {
  const [institutionCode, setInstitutionCode] = useState("GETPAY-DEMO");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        institutionCode,
        email,
      });
      setMessage(res.data.message || "If the account exists, a reset link has been sent.");
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "Could not request reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            <FiMail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reset password</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get a secure reset link for your account.</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            {message}
          </div>
        )}

        {resetUrl && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-semibold">Development reset link</p>
            <Link className="mt-2 block break-all text-blue-700 underline dark:text-blue-300" to={resetUrl.replace(window.location.origin, "")}>
              {resetUrl}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Institution Code</label>
            <input
              value={institutionCode}
              onChange={(event) => setInstitutionCode(event.target.value.toUpperCase())}
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
          <FiArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
