import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiShield, FiUserPlus } from "react-icons/fi";
import api from "../../services/api";

const emptyRole = { name: "", description: "", permissions: [] };
const emptyStaff = { name: "", email: "", employeeCode: "", roleIds: [] };

export default function StaffManagement() {
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      groups[permission.group] = groups[permission.group] || [];
      groups[permission.group].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [permissionRes, roleRes, staffRes] = await Promise.all([
        api.get("/admin/permissions"),
        api.get("/admin/roles"),
        api.get("/admin/staff")
      ]);
      setPermissions(permissionRes.data.permissions || []);
      setRoles(roleRes.data || []);
      setStaff(staffRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load staff and roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const togglePermission = (permission) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission]
    }));
  };

  const toggleStaffRole = (roleId) => {
    setStaffForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((item) => item !== roleId)
        : [...current.roleIds, roleId]
    }));
  };

  const createRole = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/roles", roleForm);
      setRoleForm(emptyRole);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create role");
    }
  };

  const createStaff = async (event) => {
    event.preventDefault();
    setError("");
    setTemporaryPassword("");
    try {
      const res = await api.post("/admin/staff", staffForm);
      setTemporaryPassword(res.data.temporaryPassword || "");
      setStaffForm(emptyStaff);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create staff user");
    }
  };

  const resetStaffPassword = async (staffId) => {
    setError("");
    setTemporaryPassword("");
    try {
      const res = await api.patch(`/admin/staff/${staffId}`, { resetPassword: true });
      setTemporaryPassword(res.data.temporaryPassword || "");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to reset staff password");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff & Roles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create staff users and assign permission-based roles.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {temporaryPassword && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Temporary password generated: <span className="font-semibold">{temporaryPassword}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={createRole} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <FiShield className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Role</h2>
          </div>
          <div className="grid gap-4">
            <input
              value={roleForm.name}
              onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })}
              placeholder="Role name, e.g. Accountant"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              required
            />
            <input
              value={roleForm.description}
              onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })}
              placeholder="Short description"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase text-gray-500">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={roleForm.permissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="rounded border-gray-300"
                        />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save Role
            </button>
          </div>
        </form>

        <form onSubmit={createStaff} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-2">
            <FiUserPlus className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Staff</h2>
          </div>
          <div className="grid gap-4">
            <input
              value={staffForm.name}
              onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })}
              placeholder="Staff name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              required
            />
            <input
              value={staffForm.email}
              onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })}
              placeholder="Email"
              type="email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              required
            />
            <input
              value={staffForm.employeeCode}
              onChange={(event) => setStaffForm({ ...staffForm, employeeCode: event.target.value })}
              placeholder="Employee code"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              required
            />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Assign roles</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <label key={role._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={staffForm.roleIds.includes(role._id)}
                      onChange={() => toggleStaffRole(role._id)}
                      className="rounded border-gray-300"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Create Staff
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Employee Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Roles</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td className="px-4 py-5 text-gray-500" colSpan="6">Loading staff...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td className="px-4 py-5 text-gray-500" colSpan="6">No staff users yet.</td></tr>
              ) : staff.map((person) => (
                <tr key={person._id}>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{person.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{person.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{person.registrationNo}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {(person.roleIds || []).map((role) => role.name).join(", ") || "No roles"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{person.status}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => resetStaffPassword(person._id)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
