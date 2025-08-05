import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import AdminDashboard from "./pages/AdminDashboard";
// import StudentDashboard from "./pages/StudentDashboard";
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
          {/* <Route path="/student" element={<StudentDashboard />} /> */}
          {/* <Route path="/payment/:id" element={<PaymentPage />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
