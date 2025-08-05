import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import AdminDashboard from "./pages/AdminDashboard";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import Fees from "./pages/Fees";
import History from "./pages/History";
// import PaymentPage from "./pages/PaymentPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          <Route path="/student" element={<StudentLayout />}>
    <Route path="dashboard" element={<StudentDashboard />} />
    <Route path="fees" element={<Fees />} />
    <Route path="history" element={<History />} />
  </Route>
          {/* <Route path="/payment/:id" element={<PaymentPage />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
