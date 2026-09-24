import { Route, Routes } from "react-router-dom";
import { AboutPage } from "../pages/public/About";
import { CertificateVerificationPage } from "../pages/public/CertificateVerification";
import { HomePage } from "../pages/public/Home";
import { WorkshopDetailsPage } from "../pages/public/WorkshopDetails";
import { WorkshopsPage } from "../pages/public/Workshops";
import { ForgotPasswordPage } from "../pages/auth/ForgotPassword";
import { LoginPage } from "../pages/auth/Login";
import { RegisterPage } from "../pages/auth/Register";
import { ResetPasswordPage } from "../pages/auth/ResetPassword";
import { VerifyEmailPage } from "../pages/auth/VerifyEmail";
import { AcademicProfilePage } from "../pages/participant/AcademicProfile";
import { AssessmentsPage } from "../pages/participant/Assessments";
import { AttendancePage } from "../pages/participant/Attendance";
import { CertificatesPage } from "../pages/participant/Certificates";
import { CommunitiesPage } from "../pages/participant/Communities";
import { ParticipantDashboardPage } from "../pages/participant/Dashboard";
import { LearningPathsPage } from "../pages/participant/LearningPaths";
import { MyWorkshopsPage } from "../pages/participant/MyWorkshops";
import { NotificationsPage } from "../pages/participant/Notifications";
import { ProfilePage } from "../pages/participant/Profile";
import { RecommendationsPage } from "../pages/participant/Recommendations";
import { SessionsPage } from "../pages/participant/Sessions";
import { SkillsPage } from "../pages/participant/Skills";
import { WorkshopLearningPage } from "../pages/participant/WorkshopLearning";
import { ScanVerifyPage } from "../pages/participant/ScanVerify";
import { OrganizerAnalyticsPage } from "../pages/organizer/Analytics";
import { AnnouncementsPage } from "../pages/organizer/Announcements";
import { OrganizerAssessmentsPage } from "../pages/organizer/Assessments";
import { OrganizerAttendancePage } from "../pages/organizer/Attendance";
import { OrganizerCertificatesPage } from "../pages/organizer/Certificates";
import { CreateWorkshopPage } from "../pages/organizer/CreateWorkshop";
import { OrganizerDashboardPage } from "../pages/organizer/Dashboard";
import { EditWorkshopPage } from "../pages/organizer/EditWorkshop";
import { ParticipantsPage } from "../pages/organizer/Participants";
import { OrganizerSessionsPage } from "../pages/organizer/Sessions";
import { OrganizerWorkshopDetailsPage } from "../pages/organizer/WorkshopDetails";
import { OrganizerWorkshopsPage } from "../pages/organizer/Workshops";
import { AdminDashboardPage } from "../pages/admin/Dashboard";
import { AuditLogsPage } from "../pages/admin/AuditLogs";
import { OrganizersPage } from "../pages/admin/Organizers";
import { SettingsPage } from "../pages/admin/Settings";
import { UsersPage } from "../pages/admin/Users";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workshops" element={<WorkshopsPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/verify/:certificateId" element={<CertificateVerificationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={["PARTICIPANT"]} />}>
          <Route path="/participant" element={<ParticipantDashboardPage />} />
          <Route path="/participant/profile" element={<ProfilePage />} />
          <Route path="/participant/academic-profile" element={<AcademicProfilePage />} />
          <Route path="/participant/workshops" element={<MyWorkshopsPage />} />
          <Route path="/participant/workshops/:id/learn" element={<WorkshopLearningPage />} />
          <Route path="/participant/sessions" element={<SessionsPage />} />
          <Route path="/participant/attendance" element={<AttendancePage />} />
          <Route path="/participant/assessments" element={<AssessmentsPage />} />
          <Route path="/participant/certificates" element={<CertificatesPage />} />
          <Route path="/participant/notifications" element={<NotificationsPage />} />
          <Route path="/participant/recommendations" element={<RecommendationsPage />} />
          <Route path="/participant/communities" element={<CommunitiesPage />} />
          <Route path="/participant/learning-paths" element={<LearningPathsPage />} />
          <Route path="/participant/skills" element={<SkillsPage />} />
        </Route>
        <Route element={<RoleRoute allow={["ORGANIZER"]} />}>
          <Route path="/organizer" element={<OrganizerDashboardPage />} />
          <Route path="/organizer/workshops" element={<OrganizerWorkshopsPage />} />
          <Route path="/organizer/workshops/new" element={<CreateWorkshopPage />} />
          <Route path="/organizer/workshops/:id/edit" element={<EditWorkshopPage />} />
          <Route path="/organizer/workshops/:id" element={<OrganizerWorkshopDetailsPage />} />
          <Route path="/organizer/sessions" element={<OrganizerSessionsPage />} />
          <Route path="/organizer/participants" element={<ParticipantsPage />} />
          <Route path="/organizer/attendance" element={<OrganizerAttendancePage />} />
          <Route path="/organizer/assessments" element={<OrganizerAssessmentsPage />} />
          <Route path="/organizer/certificates" element={<OrganizerCertificatesPage />} />
          <Route path="/organizer/announcements" element={<AnnouncementsPage />} />
          <Route path="/organizer/analytics" element={<OrganizerAnalyticsPage />} />
        </Route>
        <Route element={<RoleRoute allow={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/organizers" element={<OrganizersPage />} />

          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
        {/* Scan route accessible by all authenticated users */}
        <Route path="/scan" element={<ScanVerifyPage />} />
      </Route>
    </Routes>
  );
}
