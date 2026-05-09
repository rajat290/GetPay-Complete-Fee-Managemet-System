import { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FiBriefcase, FiGlobe, FiHome, FiInbox, FiLogOut, FiShield } from "react-icons/fi";
import { AuthContext } from "../context/authContextValue";

const navigation = [
  { name: "Overview", href: "/super-admin/dashboard", icon: FiHome },
  { name: "Organizations", href: "/super-admin/institutions", icon: FiBriefcase },
  { name: "Leads & Queries", href: "/super-admin/leads", icon: FiInbox },
  { name: "Website Manager", href: "/super-admin/website", icon: FiGlobe }
];

export default function SuperAdminLayout() {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white">
      <aside className="hidden w-72 border-r border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block">
        <div className="border-b border-slate-200 p-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <FiShield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">GetPay Platform</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-72 border-t border-slate-200 p-4 dark:border-gray-800">
          <p className="truncate text-sm font-medium">{user?.name || "Platform Owner"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
