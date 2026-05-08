import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ActivateAccount = lazy(() => import("./pages/ActivateAccount"));
const StudentLayout = lazy(() => import("./layouts/StudentLayout"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Fees = lazy(() => import("./pages/Fees"));
const History = lazy(() => import("./pages/History"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const Receipts = lazy(() => import("./pages/Receipts"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageFees = lazy(() => import("./pages/admin/ManageFees"));
const ManagePayments = lazy(() => import("./pages/admin/ManagePayments"));
const FinanceWorkspace = lazy(() => import("./pages/admin/FinanceWorkspace"));
const ReminderCampaigns = lazy(() => import("./pages/admin/ReminderCampaigns"));
const AuditTrail = lazy(() => import("./pages/admin/AuditTrail"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const InstitutionSettings = lazy(() => import("./pages/admin/InstitutionSettings"));

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/activate-account" element={<ActivateAccount />} />

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="fees" element={<Fees />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="receipts" element={<Receipts />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="fees" element={<ManageFees />} />
                <Route path="payments" element={<ManagePayments />} />
                <Route path="finance" element={<FinanceWorkspace />} />
                <Route path="reminder-campaigns" element={<ReminderCampaigns />} />
                <Route path="audit-trail" element={<AuditTrail />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<InstitutionSettings />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
