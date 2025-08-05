import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center text-lg font-bold">
            <Link to="/">GetPay</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!user && (
              <>
                <Link to="/" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Login
                </Link>
                <Link to="/register" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Register
                </Link>
              </>
            )}

            {user && user.role === "student" && (
              <Link
                to="/student"
                className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded text-white"
              >
                Student Dashboard
              </Link>
            )}

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded text-black"
              >
                Admin Dashboard
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          {!user && (
            <>
              <Link to="/" className="block hover:bg-blue-800 px-3 py-2 rounded">
                Login
              </Link>
              <Link to="/register" className="block hover:bg-blue-800 px-3 py-2 rounded">
                Register
              </Link>
            </>
          )}

          {user && user.role === "student" && (
            <Link
              to="/student"
              className="block bg-green-500 hover:bg-green-600 px-3 py-2 rounded text-white"
            >
              Student Dashboard
            </Link>
          )}

          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded text-black"
            >
              Admin Dashboard
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="block w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
