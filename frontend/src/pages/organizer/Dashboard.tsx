import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { Loader } from "../../components/common/Loader";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceButton } from "../../components/trace/TraceButton";
import { organizerAnalytics } from "../../services/analytics.service";

export function OrganizerDashboardPage() {
  const query = useQuery({ queryKey: ["analytics", "organizer"], queryFn: organizerAnalytics });
  const data = query.data;

  return (
    <OrganizerLayout title="Organizer Console Overview">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFC1B0]/60 pb-4">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
              Educator & Faculty Workspace
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#1A1412] font-normal mt-1">
              Workshop Management Hub
            </h2>
          </div>
          <Link to="/organizer/workshops/new">
            <TraceButton icon="add_circle">
              Create New Workshop
            </TraceButton>
          </Link>
        </div>

        {query.isLoading ? <Loader /> : null}

        {data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Active Workshops
              </span>
              <span className="font-serif text-4xl text-[#1A1412]">{data.workshops}</span>
              <span className="font-sans text-xs text-[#5F524B]">Published & drafting tracks</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Total Enrolments
              </span>
              <span className="font-serif text-4xl text-[#BF9270]">{data.registrations}</span>
              <span className="font-sans text-xs text-[#5F524B]">Confirmed scholar registrations</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Attendance Logs
              </span>
              <span className="font-serif text-4xl text-[#1A1412]">{data.attendanceMarks}</span>
              <span className="font-sans text-xs text-[#5F524B]">QR & manual check-ins</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
                Certificates Issued
              </span>
              <span className="font-serif text-4xl text-[#1A1412]">{data.certificatesIssued}</span>
              <span className="font-sans text-xs text-[#5F524B]">Verified credential records</span>
            </div>
          </div>
        ) : null}

        {/* Quick Management Links */}
        <section className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#DFC1B0]/60 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-[#1A1412]">Quick Console Actions</h3>
            <TraceBadge variant="cream">Faculty Toolkit</TraceBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/organizer/workshops"
              className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg hover:border-[#BF9270] transition-colors flex flex-col gap-1"
            >
              <span className="font-serif text-base font-medium text-[#1A1412]">Manage Workshops</span>
              <span className="font-sans text-xs text-[#5F524B]">Edit curriculum, mode, and capacity limits.</span>
            </Link>

            <Link
              to="/organizer/sessions"
              className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg hover:border-[#BF9270] transition-colors flex flex-col gap-1"
            >
              <span className="font-serif text-base font-medium text-[#1A1412]">Session Scheduling</span>
              <span className="font-sans text-xs text-[#5F524B]">Schedule live sessions & generate QR tokens.</span>
            </Link>

            <Link
              to="/organizer/attendance"
              className="p-4 bg-[#FFEDDB]/40 border border-[#DFC1B0]/60 rounded-lg hover:border-[#BF9270] transition-colors flex flex-col gap-1"
            >
              <span className="font-serif text-base font-medium text-[#1A1412]">Track Attendance</span>
              <span className="font-sans text-xs text-[#5F524B]">Verify participant presence and compute thresholds.</span>
            </Link>
          </div>
        </section>
      </div>
    </OrganizerLayout>
  );
}
