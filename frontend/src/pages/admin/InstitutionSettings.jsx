import { useEffect, useMemo, useState } from "react";
import { FiBriefcase, FiImage, FiMail, FiPhone, FiSave, FiSettings } from "react-icons/fi";
import api from "../../services/api";

const emptySettings = {
  name: "",
  code: "",
  type: "school",
  email: "",
  phone: "",
  address: "",
  branding: {
    logoUrl: "",
    primaryColor: "#2563eb",
    receiptFooter: ""
  },
  billingContact: {
    name: "",
    email: "",
    phone: ""
  }
};

const mergeSettings = (data = {}) => ({
  ...emptySettings,
  ...data,
  branding: {
    ...emptySettings.branding,
    ...(data.branding || {})
  },
  billingContact: {
    ...emptySettings.billingContact,
    ...(data.billingContact || {})
  }
});

export default function InstitutionSettings() {
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const primaryColor = useMemo(
    () => (/^#[0-9a-f]{6}$/i.test(settings.branding.primaryColor) ? settings.branding.primaryColor : "#2563eb"),
    [settings.branding.primaryColor]
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/institution");
        setSettings(mergeSettings(res.data));
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load institution settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const updateNestedField = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: settings.name,
        type: settings.type,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        branding: settings.branding,
        billingContact: settings.billingContact
      };

      const res = await api.patch("/admin/institution", payload);
      setSettings(mergeSettings(res.data));
      setMessage("Institution settings saved");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-64 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Institution Settings</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {settings.code ? `${settings.code} account configuration` : "Account configuration"}
          </p>
        </div>
        <button
          type="submit"
          form="institution-settings-form"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave className="h-4 w-4" />
          {saving ? "Saving" : "Save Changes"}
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-300"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form
          id="institution-settings-form"
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FiBriefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution Name</span>
                <input
                  value={settings.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution Type</span>
                <select
                  value={settings.type}
                  onChange={(event) => updateField("type", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="coaching">Coaching</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                <input
                  value={settings.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</span>
                <textarea
                  value={settings.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  rows="3"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-4 flex items-center gap-2">
              <FiImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Branding</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</span>
                <input
                  value={settings.branding.logoUrl}
                  onChange={(event) => updateNestedField("branding", "logoUrl", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</span>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => updateNestedField("branding", "primaryColor", event.target.value)}
                    className="h-10 w-14 rounded-l-md border border-r-0 border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-900"
                  />
                  <input
                    value={settings.branding.primaryColor}
                    onChange={(event) => updateNestedField("branding", "primaryColor", event.target.value)}
                    className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Footer</span>
                <textarea
                  value={settings.branding.receiptFooter}
                  onChange={(event) => updateNestedField("branding", "receiptFooter", event.target.value)}
                  rows="3"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-4 flex items-center gap-2">
              <FiSettings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Billing Contact</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
                <input
                  value={settings.billingContact.name}
                  onChange={(event) => updateNestedField("billingContact", "name", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                <input
                  type="email"
                  value={settings.billingContact.email}
                  onChange={(event) => updateNestedField("billingContact", "email", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                <input
                  value={settings.billingContact.phone}
                  onChange={(event) => updateNestedField("billingContact", "phone", event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </label>
            </div>
          </section>
        </form>

        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-lg font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {settings.branding.logoUrl ? (
                  <img
                    src={settings.branding.logoUrl}
                    alt=""
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  settings.name?.slice(0, 2).toUpperCase() || "GP"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                  {settings.name || "Institution"}
                </h3>
                <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{settings.type}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <FiMail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{settings.email || "No email set"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="h-4 w-4 text-gray-400" />
                <span>{settings.phone || "No phone set"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Receipt</p>
              <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{settings.name}</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Fee</span>
                <span className="font-medium text-gray-900 dark:text-white">Tuition Fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">INR 25,000</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
            <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
              {settings.branding.receiptFooter || "Thank you for your payment."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
