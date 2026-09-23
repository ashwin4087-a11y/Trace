import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Button } from "../../components/common/Button";
import { SearchBar } from "../../components/common/SearchBar";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  assignUserRole,
  getUser,
  listUsers,
  setUserStatus,
  updateUser,
} from "../../services/user.service";
import type { AccountStatus, Role } from "../../types/auth";

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "#D1FAE5", text: "#065F46", label: "Active" },
  SUSPENDED: { bg: "#FEE2E2", text: "#991B1B", label: "Suspended" },
  DEACTIVATED: { bg: "#F3F4F6", text: "#6B7280", label: "Deactivated" },
  PENDING_VERIFICATION: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
};

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "#EDE9FE", text: "#5B21B6" },
  ORGANIZER: { bg: "#FFEDD5", text: "#9A3412" },
  PARTICIPANT: { bg: "#DBEAFE", text: "#1E40AF" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { bg: "#F3F4F6", text: "#374151", label: status };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text, fontFamily: "Manrope, sans-serif" }}
    >
      {s.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const r = ROLE_BADGE[role] ?? { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: r.bg, color: r.text, fontFamily: "Manrope, sans-serif" }}
    >
      {role}
    </span>
  );
}

function FieldInput({
  label,
  name,
  defaultValue,
  disabled,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-xs font-semibold uppercase tracking-wider text-[#BF9270]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        className="px-3 py-2 rounded-xl border border-[#DFC1B0] bg-[#FFEDDB]/40 text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270] disabled:opacity-50"
        style={{ fontFamily: "Manrope, sans-serif" }}
      />
    </label>
  );
}

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AccountStatus | "">("");
  const [role, setRole] = useState<Role | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const { hasPermission } = useAuth();

  const query = useQuery({
    queryKey: ["users", search, status, role],
    queryFn: () =>
      listUsers({
        search: search || undefined,
        status: status || undefined,
        role: role || undefined,
      }),
  });

  const detail = useQuery({
    queryKey: ["user", selectedId],
    queryFn: () => getUser(selectedId!),
    enabled: Boolean(selectedId),
  });

  const selected = detail.data;
  const canUpdate = hasPermission("user.write");
  const canChangeStatus = hasPermission("user.suspend");
  const canChangeRole = hasPermission("role.write");

  useEffect(() => {
    setNotice("");
  }, [selectedId]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !canUpdate) return;
    const form = new FormData(event.currentTarget);
    await updateUser(selected.id, {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      name: String(form.get("name") ?? "") || null,
      phone: String(form.get("phone") ?? "") || null,
    });
    setNotice("User details updated successfully.");
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  async function changeStatus(nextStatus: AccountStatus) {
    if (!selected || !canChangeStatus) return;
    await setUserStatus(selected.id, nextStatus);
    setNotice(`User ${nextStatus.toLowerCase().replace("_", " ")}.`);
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  async function changeRole(nextRole: Role) {
    if (!selected || !canChangeRole) return;
    await assignUserRole(selected.id, nextRole);
    setNotice("Role updated.");
    await Promise.all([query.refetch(), detail.refetch()]);
  }

  const selectCls =
    "px-3 py-2 rounded-xl border border-[#DFC1B0] bg-white text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270]";

  return (
    <AdminLayout title="User Directory">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        </div>
        <select
          className={selectCls}
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="PARTICIPANT">Participant</option>
        </select>
        <select
          className={selectCls}
          value={status}
          onChange={(e) => setStatus(e.target.value as AccountStatus | "")}
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DEACTIVATED">Deactivated</option>
          <option value="PENDING_VERIFICATION">Pending verification</option>
        </select>
      </div>

      {query.isLoading && <Loader label="Loading users…" />}
      {query.isError && <ErrorState message="Unable to load users." />}
      {!query.isLoading && !query.isError && !query.data?.length && (
        <div className="py-16 text-center">
          <p className="text-3xl mb-2">👥</p>
          <p
            className="text-sm text-[#261D1A]/60"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            No users match these filters.
          </p>
        </div>
      )}

      {/* User List */}
      <div className="space-y-2">
        {query.data?.map((user) => (
          <div
            key={user.id}
            className={`bg-white border rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md ${
              selectedId === user.id
                ? "border-[#BF9270] shadow-md"
                : "border-[#DFC1B0]"
            }`}
            onClick={() =>
              setSelectedId(selectedId === user.id ? null : user.id)
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-full bg-[#BF9270] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {(user.name || user.firstName).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  className="font-semibold text-sm text-[#1A1412] truncate"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {user.name || `${user.firstName} ${user.lastName}`}
                </p>
                <p
                  className="text-xs text-[#261D1A]/60 truncate"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {user.roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
              <StatusBadge status={user.status} />
              {canChangeStatus && user.status !== "SUSPENDED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(user.id);
                    void setUserStatus(user.id, "SUSPENDED").then(() =>
                      query.refetch()
                    );
                  }}
                  className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Suspend
                </button>
              )}
              {canChangeStatus && user.status === "SUSPENDED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(user.id);
                    void setUserStatus(user.id, "ACTIVE").then(() =>
                      query.refetch()
                    );
                  }}
                  className="text-xs px-3 py-1 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedId && detail.isLoading && (
        <Loader label="Loading user details…" />
      )}
      {selectedId && detail.isError && (
        <ErrorState message="Unable to load user details." />
      )}
      {selected && (
        <div className="mt-6 bg-white border border-[#DFC1B0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#DFC1B0]">
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#BF9270] to-[#E3B7A0] flex items-center justify-center text-white text-xl font-bold"
              style={{ fontFamily: "EB Garamond, Georgia, serif" }}
            >
              {(selected.name || selected.firstName).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2
                className="font-serif text-xl font-bold text-[#1A1412]"
                style={{ fontFamily: "EB Garamond, Georgia, serif" }}
              >
                {selected.name || `${selected.firstName} ${selected.lastName}`}
              </h2>
              <p
                className="text-sm text-[#261D1A]/60"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {selected.email} ·{" "}
                {selected.emailVerified ? "Email verified" : "Email unverified"}{" "}
                · Joined {new Date(selected.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {notice && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              ✅ {notice}
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Organization", value: selected.organization?.name ?? "—" },
              { label: "Department", value: selected.department?.name ?? "—" },
              { label: "Status", value: selected.status },
              { label: "Roles", value: selected.roles.join(", ") },
            ].map((item) => (
              <div key={item.label} className="bg-[#FFEDDB]/50 rounded-xl px-4 py-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-[#BF9270] mb-1"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-sm font-medium text-[#1A1412]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
            onSubmit={(e) => void saveProfile(e)}
          >
            <FieldInput
              label="Display Name"
              name="name"
              defaultValue={selected.name ?? ""}
              disabled={!canUpdate}
            />
            <FieldInput
              label="Phone"
              name="phone"
              defaultValue={selected.phone ?? ""}
              disabled={!canUpdate}
            />
            <FieldInput
              label="First Name"
              name="firstName"
              defaultValue={selected.firstName}
              disabled={!canUpdate}
            />
            <FieldInput
              label="Last Name"
              name="lastName"
              defaultValue={selected.lastName}
              disabled={!canUpdate}
            />
            {canUpdate && (
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit">Save Details</Button>
              </div>
            )}
          </form>

          {/* Role assignment */}
          {canChangeRole && (
            <div className="mb-6">
              <label className="flex flex-col gap-2 max-w-xs">
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-[#BF9270]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Primary Role
                </span>
                <select
                  className="px-3 py-2 rounded-xl border border-[#DFC1B0] bg-white text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270]"
                  value={selected.role}
                  onChange={(e) => void changeRole(e.target.value as Role)}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="ORGANIZER">Organizer</option>
                  <option value="PARTICIPANT">Participant</option>
                </select>
              </label>
            </div>
          )}

          {/* Status actions */}
          {canChangeStatus && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#DFC1B0]">
              <button
                onClick={() => void changeStatus("ACTIVE")}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                ✅ Activate
              </button>
              <button
                onClick={() => void changeStatus("SUSPENDED")}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                🚫 Suspend
              </button>
              <button
                onClick={() => void changeStatus("DEACTIVATED")}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                ⛔ Deactivate
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}


