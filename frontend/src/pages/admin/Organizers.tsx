import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { errorText } from "../../lib/errors";
import { createOrganizer, listUsers } from "../../services/user.service";
import { PasswordInput } from "../../components/common/PasswordInput";

export function OrganizersPage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["users", "ORGANIZER"],
    queryFn: () => listUsers({ role: "ORGANIZER" }),
  });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const mutation = useMutation({
    mutationFn: () => createOrganizer(form),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["users", "ORGANIZER"] });
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    },
  });

  const inputCls =
    "px-3 py-2 rounded-xl border border-[#DFC1B0] bg-[#FFEDDB]/40 text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270] w-full";
  const labelCls = "text-xs font-semibold uppercase tracking-wider text-[#BF9270]";

  return (
    <AdminLayout title="Organizer Accounts">
      <div className="bg-white border border-[#DFC1B0] rounded-2xl p-6 shadow-sm mb-8 max-w-lg">
        <h2
          className="font-serif text-lg font-bold text-[#1A1412] mb-1"
          style={{ fontFamily: "EB Garamond, Georgia, serif" }}
        >
          Provision New Organizer
        </h2>
        <p className="text-xs text-[#261D1A]/60 mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>
          Create an organizer account and grant platform management access
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={{ fontFamily: "Manrope, sans-serif" }}>First Name</span>
              <input className={inputCls} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required style={{ fontFamily: "Manrope, sans-serif" }} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls} style={{ fontFamily: "Manrope, sans-serif" }}>Last Name</span>
              <input className={inputCls} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required style={{ fontFamily: "Manrope, sans-serif" }} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className={labelCls} style={{ fontFamily: "Manrope, sans-serif" }}>Email Address</span>
            <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ fontFamily: "Manrope, sans-serif" }} />
          </label>
          <PasswordInput
            label="Temporary Password"
            labelClassName={labelCls}
            className={inputCls}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ fontFamily: "Manrope, sans-serif" }}
          />
          {mutation.isError ? (
            <p className="text-xs text-red-600" style={{ fontFamily: "Manrope, sans-serif" }}>
              {errorText(mutation.error)}
            </p>
          ) : null}
          {mutation.isSuccess ? (
            <p className="text-xs text-green-700" style={{ fontFamily: "Manrope, sans-serif" }}>
              ✅ Organizer provisioned successfully.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-[#BF9270] text-white text-sm font-semibold hover:bg-[#A67C5B] transition-colors disabled:opacity-50 self-start"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {mutation.isPending ? "Creating…" : "Provision Organizer"}
          </button>
        </form>
      </div>

      {query.isLoading && <Loader label="Loading organizers…" />}
      {query.isError && <ErrorState message="Unable to load organizers." />}
      {!query.isLoading && !query.isError && !query.data?.length && (
        <div className="py-12 text-center">
          <p className="text-3xl mb-2">🎓</p>
          <p className="text-sm text-[#261D1A]/60" style={{ fontFamily: "Manrope, sans-serif" }}>
            No organizers provisioned yet.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {query.data?.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-[#DFC1B0] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#BF9270] to-[#E3B7A0] flex items-center justify-center text-white font-bold text-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {(user.name || user.firstName).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1412]" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {user.name || `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-xs text-[#261D1A]/60" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {user.email}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.status === "ACTIVE"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-500 border border-gray-200"
              }`}
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {user.status}
            </span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
