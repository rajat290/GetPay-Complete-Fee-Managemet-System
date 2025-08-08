import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function StudentProfileModal({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      // In a real app, you might fetch additional details from API
      setStudentDetails({
        name: user.name,
        email: user.email,
        registrationNo: user.registrationNo,
        className: user.className,
        phone: user.phone || "Not provided",
        address: user.address || "Not provided",
        dateOfBirth: user.dateOfBirth || "Not provided",
        admissionDate: user.admissionDate || "Not provided",
        profilePicture: user.profilePicture || null
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {studentDetails ? (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="relative">
                  {studentDetails.profilePicture ? (
                    <img
                      src={studentDetails.profilePicture}
                      alt={studentDetails.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100 dark:border-blue-900">
                      <FiUser className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Student Name */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{studentDetails.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{studentDetails.className}</p>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiUser className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.registrationNo}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiMail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiPhone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiMapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiCalendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.dateOfBirth}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <FiBook className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Admission Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{studentDetails.admissionDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading profile...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
