import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import {
  createOrganization,
  listOrganizations,
  setOrganizationStatus,
} from "../../services/organization.service";

export function OrganizationsPage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
  });
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: () => createOrganization({ name, code }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["organizations"] });
      setName("");
      setCode("");
      setFormError("");
    },
    onError: () => setFormError("Failed to create organization. Please try again."),
  });

  const inputCls =
    "px-3 py-2 rounded-xl border border-[#DFC1B0] bg-[#FFEDDB]/40 text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270] w-full";

  return (
    <AdminLayout title="Institutions & Organizations">
      {/* Create form */}
      <div className="bg-white border border-[#DFC1B0] rounded-2xl p-6 shadow-sm mb-8 max-w-lg">
        <h2
          className="font-serif text-lg font-bold text-[#1A1412] mb-1"
          style={{ fontFamily: "EB Garamond, Georgia, serif" }}
        >
          Register New Institution
        </h2>
        <p
          className="text-xs text-[#261D1A]/60 mb-5"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Create a new organizational entity on the platform
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="flex flex-col gap-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider text-[#BF9270]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Institution Name
            </span>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anna University"
              required
              style={{ fontFamily: "Manrope, sans-serif" }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider text-[#BF9270]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Institution Code
            </span>
            <input
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AU"
              required
              style={{ fontFamily: "Manrope, sans-serif" }}
            />
          </label>
          {formError && (
            <p className="text-xs text-red-600" style={{ fontFamily: "Manrope, sans-serif" }}>
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-[#BF9270] text-white text-sm font-semibold hover:bg-[#A67C5B] transition-colors disabled:opacity-50 self-start"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {mutation.isPending ? "Creating…" : "Register Institution"}
          </button>
        </form>
      </div>

      {/* List */}
      {query.isLoading && <Loader label="Loading organizations…" />}
      {query.isError && <ErrorState message="Unable to load organizations." />}
      {!query.isLoading && !query.isError && !query.data?.length && (
        <div className="py-12 text-center">
          <p className="text-3xl mb-2">🏛️</p>
          <p className="text-sm text-[#261D1A]/60" style={{ fontFamily: "Manrope, sans-serif" }}>
            No organizations registered yet.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {query.data?.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#DFC1B0] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-[#FFEDDB] border border-[#DFC1B0] flex items-center justify-center font-bold text-[#BF9270] text-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.code.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-semibold text-sm text-[#1A1412]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {item.name}
                </p>
                <p
                  className="text-xs text-[#261D1A]/60"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Code: {item.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  item.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-500 border border-gray-200"
                }`}
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.status}
              </span>
              <button
                onClick={() =>
                  void setOrganizationStatus(
                    item.id,
                    item.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
                  ).then(() =>
                    client.invalidateQueries({ queryKey: ["organizations"] })
                  )
                }
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                  item.status === "ACTIVE"
                    ? "border-red-200 text-red-700 hover:bg-red-50"
                    : "border-green-200 text-green-700 hover:bg-green-50"
                }`}
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}



