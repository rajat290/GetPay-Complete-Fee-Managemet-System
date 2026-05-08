import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiLock } from "react-icons/fi";
import api from "../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/authContextValue";

export default function ActivateAccount() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = params.get("token") || "";
  const institutionCode = useMemo(() => params.get("institutionCode") || "GETPAY-DEMO", [params]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/activate-account", {
        institutionCode,
        token,
        password,
      });
      login(res.data.user, res.data.user.token);
      setMessage("Account activated successfully.");
      setTimeout(() => navigate("/student/dashboard"), 800);
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "Could not activate account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            <FiCheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activate account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Set your password to start using GetPay.</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            {message}
          </div>
        )}

        {!token ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            Invitation token is missing. Ask your institution admin to resend the invite.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
              <div className="relative mt-1">
                <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-9 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
              <input
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? "Activating..." : "Activate account"}
            </button>
          </form>
        )}

        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-blue-700 dark:text-blue-300">
          Back to login
        </Link>
      </div>
    </div>
  );
}
