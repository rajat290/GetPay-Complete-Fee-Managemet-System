import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64 transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg`}
      >
        <div className="p-4 text-xl font-bold border-b dark:border-gray-700">
          Student Panel
        </div>
        <nav className="p-4 space-y-4">
          <Link
            to="/student/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/student/fees"
            className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            💳 Fees
          </Link>
          <Link
            to="/student/history"
            className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            📜 Fee History
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 shadow-md">
          <button
            className="md:hidden p-2 rounded bg-gray-200 dark:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">Student Dashboard</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
