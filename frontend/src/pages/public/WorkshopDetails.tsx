import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { useAuth } from "../../context/AuthContext";
import { errorText } from "../../lib/errors";
import { register } from "../../services/registration.service";
import { getWorkshop } from "../../services/workshop.service";

export function WorkshopDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["workshop", id], queryFn: () => getWorkshop(id), enabled: Boolean(id) });
  const mutation = useMutation({
    mutationFn: () => register(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["my-registrations"] }),
  });
  const workshop = query.data;

  return (
    <MainLayout>
      <div className="max-w-[1240px] mx-auto py-6 md:py-10 flex flex-col gap-8">
        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message={errorText(query.error)} /> : null}

        {workshop ? (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
            <article className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
              <div className="border-b border-[#DFC1B0]/60 pb-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <TraceBadge variant="terracotta">{workshop.status}</TraceBadge>
                  <TraceBadge variant="cream">{workshop.mode}</TraceBadge>
                  {workshop.domain && <TraceBadge variant="default">{workshop.domain}</TraceBadge>}
                </div>
                <h1 className="font-serif text-3xl md:text-5xl text-[#1A1412] font-normal leading-tight">
                  {workshop.title}
                </h1>
                <p className="font-sans text-xs text-[#5F524B]">
                  Organized by <span className="font-semibold text-[#1A1412]">{workshop.trainerName || "Faculty Instructor"}</span>
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-[#1A1412] font-medium mb-2">Curriculum Overview</h2>
                <p className="font-sans text-sm md:text-base text-[#5F524B] leading-relaxed whitespace-pre-wrap">
                  {workshop.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FFEDDB]/40 p-4 rounded-lg border border-[#DFC1B0]/60">
                <div>
                  <span className="font-sans text-xs text-[#5F524B] block uppercase tracking-wider font-semibold">Instructor</span>
                  <span className="font-sans text-sm text-[#1A1412] font-medium">{workshop.trainerName || "Faculty"}</span>
                </div>
                <div>
                  <span className="font-sans text-xs text-[#5F524B] block uppercase tracking-wider font-semibold">Level</span>
                  <span className="font-sans text-sm text-[#1A1412] font-medium">{workshop.level || "All Levels"}</span>
                </div>
                <div>
                  <span className="font-sans text-xs text-[#5F524B] block uppercase tracking-wider font-semibold">Language</span>
                  <span className="font-sans text-sm text-[#1A1412] font-medium">{workshop.language || "English"}</span>
                </div>
                <div>
                  <span className="font-sans text-xs text-[#5F524B] block uppercase tracking-wider font-semibold">Seat Limit</span>
                  <span className="font-sans text-sm text-[#1A1412] font-medium">{workshop.capacity ? `${workshop.capacity} Seats` : "Open"}</span>
                </div>
              </div>

              {/* Sessions preview list if present */}
              {workshop.sessions && workshop.sessions.length > 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <h3 className="font-serif text-lg text-[#1A1412] font-medium">Session Schedule</h3>
                  <div className="space-y-2">
                    {workshop.sessions.map((sess, idx) => (
                      <div key={sess.id || idx} className="p-3 bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg text-xs flex justify-between items-center">
                        <span className="font-semibold text-[#1A1412]">Session {idx + 1}: {sess.title}</span>
                        <span className="text-[#5F524B] font-mono">{sess.startTime ? new Date(sess.startTime).toLocaleDateString() : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Registration Sidebar Card */}
            <aside className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-5 sticky top-24">
              <div className="border-b border-[#DFC1B0]/60 pb-4">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                  Registration Status
                </span>
                <h3 className="font-serif text-2xl text-[#1A1412] font-medium mt-1">
                  {workshop.priceCents === 0 ? "Free Enrollment" : `$${(workshop.priceCents / 100).toFixed(2)}`}
                </h3>
              </div>

              <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
                {workshop.priceCents === 0
                  ? "This workshop is open for registration. Completing required sessions unlocks your verifiable certificate."
                  : "Paid workshop. Secured checkout with cryptographic proof generation."}
              </p>

              {user?.role === "PARTICIPANT" ? (
                <TraceButton
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  className="w-full justify-center"
                  icon="add_circle"
                >
                  {mutation.isPending ? "Registering..." : "Register Now"}
                </TraceButton>
              ) : user ? (
                <div className="p-3 bg-[#FFEDDB] border border-[#DFC1B0] rounded-lg text-xs text-[#5F524B] text-center">
                  Signed in as <span className="font-bold text-[#1A1412]">{user.role}</span>. Registration is for participant accounts.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login">
                    <TraceButton className="w-full justify-center" icon="login">
                      Sign In to Register
                    </TraceButton>
                  </Link>
                  <Link to="/register" className="text-xs text-center text-[#BF9270] font-semibold hover:underline">
                    Create a scholar account
                  </Link>
                </div>
              )}

              {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
              {mutation.isSuccess ? (
                <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs text-[#1A1412] font-medium text-center">
                  Successfully registered! Status: <span className="font-bold">{mutation.data.status}</span>.
                </div>
              ) : null}

              {workshop.meetingUrl && (
                <p className="font-sans text-xs text-[#5F524B] border-t border-[#DFC1B0]/60 pt-3">
                  Meeting link and interactive learning materials will be accessible after enrollment confirmation.
                </p>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}

