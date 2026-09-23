import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { api, unwrap } from "../../services/api";

type Settings = {
  platformName: string;
  certificateMinPercent: number;
  maintenanceMode: boolean;
  timezone: string;
};

export function SettingsPage() {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: () => unwrap<Settings>(api.get("/settings")),
  });
  const [name, setName] = useState("");
  const [percent, setPercent] = useState("90");
  const [saved, setSaved] = useState(false);

  const settings = query.data;

  useEffect(() => {
    if (settings) {
      setName(settings.platformName ?? "");
      setPercent(String(settings.certificateMinPercent ?? 90));
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (body: Partial<Settings>) => unwrap(api.patch("/settings", body)),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const inputCls =
    "px-3 py-2 rounded-xl border border-[#DFC1B0] bg-[#FFEDDB]/40 text-sm text-[#1A1412] focus:outline-none focus:border-[#BF9270] w-full";
  const labelCls = "text-xs font-semibold uppercase tracking-wider text-[#BF9270]";

  return (
    <AdminLayout title="Platform Configuration">
      {query.isLoading && <Loader label="Loading settings…" />}
      {query.isError && <ErrorState message="Unable to load platform settings." />}

      {settings && (
        <div className="max-w-2xl space-y-6">
          {/* Current Summary */}
          <div className="bg-white border border-[#DFC1B0] rounded-2xl p-5 shadow-sm">
            <h2
              className="font-serif text-lg font-bold text-[#1A1412] mb-4"
              style={{ fontFamily: "EB Garamond, Georgia, serif" }}
            >
              Current Configuration
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Platform Name", value: settings.platformName },
                { label: "Min. Certificate %", value: `${settings.certificateMinPercent}%` },
                { label: "Timezone", value: settings.timezone },
                {
                  label: "Maintenance Mode",
                  value: settings.maintenanceMode ? "🚧 Active" : "✅ Disabled",
                },
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
          </div>

          {/* Edit form */}
          <div className="bg-white border border-[#DFC1B0] rounded-2xl p-5 shadow-sm">
            <h2
              className="font-serif text-lg font-bold text-[#1A1412] mb-4"
              style={{ fontFamily: "EB Garamond, Georgia, serif" }}
            >
              Update Settings
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate({
                  platformName: name || settings.platformName,
                  certificateMinPercent: Number(percent),
                });
              }}
            >
              <label className="flex flex-col gap-1">
                <span className={labelCls} style={{ fontFamily: "Manrope, sans-serif" }}>Platform Name</span>
                <input
                  className={inputCls}
                  value={name}
                  placeholder={settings.platformName}
                  onChange={(e) => setName(e.target.value)}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelCls} style={{ fontFamily: "Manrope, sans-serif" }}>Certificate Minimum (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={inputCls}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </label>
              {saved && (
                <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700" style={{ fontFamily: "Manrope, sans-serif" }}>
                  ✅ Settings saved successfully.
                </div>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-[#BF9270] text-white text-sm font-semibold hover:bg-[#A67C5B] transition-colors disabled:opacity-50 self-start"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {mutation.isPending ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white border border-[#DFC1B0] rounded-2xl p-5 shadow-sm">
            <h2
              className="font-serif text-lg font-bold text-[#1A1412] mb-2"
              style={{ fontFamily: "EB Garamond, Georgia, serif" }}
            >
              Maintenance Mode
            </h2>
            <p
              className="text-sm text-[#261D1A]/60 mb-4"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              When active, the platform displays a maintenance notice to participants and organizers.
              Admin access is unaffected.
            </p>
            <div className="flex items-center gap-4">
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.maintenanceMode ? "bg-[#BF9270]" : "bg-gray-200"
                }`}
                onClick={() =>
                  mutation.mutate({ maintenanceMode: !settings.maintenanceMode })
                }
                role="switch"
                aria-checked={settings.maintenanceMode}
                tabIndex={0}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span
                className="text-sm font-medium text-[#1A1412]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {settings.maintenanceMode ? "🚧 Maintenance mode is ON" : "✅ Platform is operational"}
              </span>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
