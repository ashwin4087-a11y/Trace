import { MainLayout } from "../../components/layout/MainLayout";

export function AboutPage() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">About AUREX LMS</h1>
      <p className="mt-4 max-w-3xl text-ink/80">
        AUREX 2026 Track 01 is a workshop and lifelong-learning portal. Administrators manage the platform and organizer accounts.
        Organizers publish workshops. Participants register, attend sessions, and receive a certificate only after the server calculates
        attendance of at least 90 percent. The interface supports English and Tamil.
      </p>
    </MainLayout>
  );
}
