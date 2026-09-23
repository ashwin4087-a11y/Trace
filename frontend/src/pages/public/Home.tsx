import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../../components/layout/MainLayout";
import { Card } from "../../components/common/Card";
import { useApp } from "../../context/AppContext";
import { listWorkshops } from "../../services/workshop.service";
import { WorkshopCard } from "../../components/workshops/WorkshopCard";

export function HomePage() {
  const { t } = useApp();
  const workshops = useQuery({ queryKey: ["workshops", "home"], queryFn: () => listWorkshops({ pageSize: 3 }) });
  return (
    <MainLayout>
      <section className="rounded-xl bg-brand px-8 py-12 text-white">
        <p className="text-sm uppercase tracking-wide text-white/80">AUREX 2026 · Track 01</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-bold">{t("tagline")}</h1>
        <p className="mt-4 max-w-2xl text-white/90">
          Discover workshops, attend sessions, and earn a certificate after the platform confirms at least 90% attendance.
        </p>
        <Link to="/workshops" className="mt-6 inline-block rounded-md bg-white px-4 py-2 font-semibold text-brand">Browse workshops</Link>
      </section>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="For participants">Register, join sessions, and keep a skill passport.</Card>
        <Card title="For organizers">Publish workshops, mark attendance, and issue certificates.</Card>
        <Card title="For administrators">Manage organizers, organizations, and platform settings.</Card>
      </div>
      <h2 className="mb-3 mt-8 text-xl font-bold">Open workshops</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {workshops.data?.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}
        {workshops.isError ? <p className="text-sm">Workshop catalog is unavailable until the API and database are running.</p> : null}
      </div>
    </MainLayout>
  );
}
