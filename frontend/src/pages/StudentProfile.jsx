import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function StudentProfile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;

  if (!profile) return <p className="text-center text-gray-600">Profile not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
          <p><span className="font-medium">Name:</span> {profile.name}</p>
          <p><span className="font-medium">Email:</span> {profile.email}</p>
          <p><span className="font-medium">Phone:</span> {profile.phone || "N/A"}</p>
          <p><span className="font-medium">Registration No:</span> {profile.registrationNo}</p>
        </div>

        {/* Academic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Academic Information</h2>
          <p><span className="font-medium">Department:</span> {profile.department || "Not Assigned"}</p>
          <p><span className="font-medium">Enrollment Date:</span> 
            {new Date(profile.enrollmentDate).toLocaleDateString()}
          </p>
        </div>

        {/* Parents Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Family Information</h2>
          <p><span className="font-medium">Father:</span> {profile.fatherName || "N/A"}</p>
          <p><span className="font-medium">Mother:</span> {profile.motherName || "N/A"}</p>
          <p><span className="font-medium">Address:</span> {profile.address || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
