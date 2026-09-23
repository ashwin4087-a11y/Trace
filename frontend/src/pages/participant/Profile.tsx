import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../../services/api";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";

export function ProfilePage() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => unwrap<Record<string, unknown>>(api.get("/profiles/me")),
  });

  const user = query.data?.user as {
    firstName?: string;
    lastName?: string;
    email?: string;
    preferredLanguage?: string;
    role?: string;
  } | undefined;

  return (
    <ParticipantLayout title="Scholar Profile">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {query.isLoading ? <Loader /> : null}

        {user ? (
          <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#DFC1B0]/60">
              <div className="w-16 h-16 rounded-full bg-[#BF9270] text-[#FFEDDB] font-serif text-2xl font-bold flex items-center justify-center shrink-0">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <TraceBadge variant="terracotta">{user.role || "Scholar"}</TraceBadge>
                  <span className="font-sans text-xs text-[#5F524B]">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg">
                <span className="text-[#5F524B] uppercase tracking-wider font-bold block mb-1">
                  Preferred Language
                </span>
                <span className="text-[#1A1412] font-semibold text-sm">
                  {user.preferredLanguage === "TA" ? "Tamil (தமிழ்)" : user.preferredLanguage === "EN_TA" ? "Bilingual" : "English"}
                </span>
              </div>
              <div className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg">
                <span className="text-[#5F524B] uppercase tracking-wider font-bold block mb-1">
                  Identity Ledger
                </span>
                <span className="text-[#1A1412] font-mono text-xs">
                  DID:AUREX-SCHOLAR-VERIFIED
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ParticipantLayout>
  );
}
