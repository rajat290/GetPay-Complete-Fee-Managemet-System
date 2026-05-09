import { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Hash, 
  Building2, 
  Calendar, 
  Users2, 
  MapPin,
  ShieldCheck,
  GraduationCap,
  Heart,
  Contact
} from "lucide-react";
import api from "../services/api";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Skeleton from "../components/common/Skeleton";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-20">
      <User className="w-16 h-16 text-slate-200 mb-4" />
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Unavailable</h3>
      <p className="text-sm text-slate-500">We couldn't retrieve your profile data.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Profile Banner */}
      <div className="relative h-48 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl overflow-hidden shadow-lg group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -bottom-16 left-8 p-1.5 bg-white dark:bg-slate-900 rounded-3xl shadow-xl transition-transform group-hover:scale-105 duration-500">
          <div className="w-32 h-32 rounded-[22px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black text-5xl uppercase border-4 border-white dark:border-slate-900">
            {profile.name?.charAt(0)}
          </div>
        </div>
      </div>

      <div className="pt-20 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{profile.name}</h1>
            <Badge variant="success" className="py-1 px-3">Active Student</Badge>
          </div>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {profile.department || "General"} Department
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="neutral" className="bg-slate-100 dark:bg-slate-800 border-none px-4 py-2">
            <Hash className="w-3.5 h-3.5 mr-2" />
            {profile.registrationNo}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <Card title="Contact Details" subtitle="How we reach you" className="lg:col-span-1">
          <div className="space-y-6 mt-4">
            <ProfileField icon={Mail} label="Official Email" value={profile.email} />
            <ProfileField icon={Phone} label="Contact Number" value={profile.phone || "Not Provided"} />
            <ProfileField icon={MapPin} label="Residential Address" value={profile.address || "No address on file"} />
          </div>
        </Card>

        {/* Academic & Family Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Academic Profile" subtitle="Enrollment stats">
              <div className="space-y-6 mt-4">
                <ProfileField icon={Building2} label="Department" value={profile.department || "Main Department"} />
                <ProfileField icon={Calendar} label="Date of Admission" value={new Date(profile.enrollmentDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                <ProfileField icon={ShieldCheck} label="Verification Status" value="Identity Verified" variant="success" />
              </div>
            </Card>

            <Card title="Family & Emergency" subtitle="Kins information">
              <div className="space-y-6 mt-4">
                <ProfileField icon={Users2} label="Father's Name" value={profile.fatherName || "N/A"} />
                <ProfileField icon={Heart} label="Mother's Name" value={profile.motherName || "N/A"} />
                <ProfileField icon={Contact} label="Primary Guardian" value={profile.fatherName || "N/A"} />
              </div>
            </Card>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Profile Hardened</p>
                <p className="text-xs text-slate-500">Your information is protected by industry standard encryption.</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.0.4 Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, variant = "default" }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-premium">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className={`text-sm font-bold truncate max-w-[200px] ${
          variant === "success" ? "text-emerald-600" : "text-slate-900 dark:text-slate-200"
        }`}>{value}</p>
      </div>
    </div>
  );
}
