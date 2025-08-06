import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ added
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import Fees from "./pages/Fees";
import History from "./pages/History";
import StudentProfile from "./pages/StudentProfile";
import Receipts from "./pages/Receipts";
import Notifications from "./pages/Notifications";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageFees from "./pages/admin/ManageFees";
import ManagePayments from "./pages/admin/ManagePayments";
import Analytics from "./pages/admin/Analytics";



function App() {
  return (
    
    <ThemeProvider> {/* ✅ Dark Mode Provider */}
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
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

            {/* Admin Routes */}
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
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
