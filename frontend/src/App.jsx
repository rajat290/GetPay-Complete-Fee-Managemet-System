import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const TrialSignup = lazy(() => import("./pages/TrialSignup"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ActivateAccount = lazy(() => import("./pages/ActivateAccount"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
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
const Reports = lazy(() => import("./pages/admin/Reports"));
const InstitutionSettings = lazy(() => import("./pages/admin/InstitutionSettings"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement"));
const SuperAdminLayout = lazy(() => import("./layouts/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/SuperAdminDashboard"));
const SuperAdminInstitutions = lazy(() => import("./pages/super-admin/SuperAdminInstitutions"));
const SuperAdminInstitutionDetail = lazy(() => import("./pages/super-admin/SuperAdminInstitutionDetail"));
const SuperAdminLeads = lazy(() => import("./pages/super-admin/SuperAdminLeads"));
const SuperAdminWebsite = lazy(() => import("./pages/super-admin/SuperAdminWebsite"));
const SuperAdminCommunications = lazy(() => import("./pages/super-admin/SuperAdminCommunications"));

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
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<LegalPage />} />
              <Route path="/privacy" element={<LegalPage />} />
              <Route path="/refund-policy" element={<LegalPage />} />
              <Route path="/support" element={<LegalPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/trial" element={<TrialSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/activate-account" element={<ActivateAccount />} />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff", "student"]}>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

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
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
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
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<InstitutionSettings />} />
                <Route path="staff" element={<StaffManagement />} />
              </Route>

              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="institutions" element={<SuperAdminInstitutions />} />
                <Route path="institutions/:institutionId" element={<SuperAdminInstitutionDetail />} />
                <Route path="leads" element={<SuperAdminLeads />} />
                <Route path="website" element={<SuperAdminWebsite />} />
                <Route path="communications" element={<SuperAdminCommunications />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
