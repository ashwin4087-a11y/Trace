import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../../components/layout/MainLayout";
import { SearchBar } from "../../components/common/SearchBar";
import { Select } from "../../components/common/Select";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { WorkshopCard } from "../../components/workshops/WorkshopCard";
import { listWorkshops } from "../../services/workshop.service";
import { errorText } from "../../lib/errors";

export function WorkshopsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const query = useQuery({
    queryKey: ["workshops", search, domain],
    queryFn: () => listWorkshops({ search: search || undefined, domain: domain || undefined }),
  });
  return (
    <MainLayout>
      <h1 className="mb-4 text-3xl font-bold">Workshops</h1>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search title or category" />
        <Select label="Domain" value={domain} onChange={(event) => setDomain(event.target.value)}>
          <option value="">All domains</option>
          <option value="ENGINEERING">Engineering</option>
          <option value="ARTS_SCIENCE">Arts & Science</option>
          <option value="TAMIL_LANGUAGE">Tamil / Language</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
      {query.data && query.data.length === 0 ? <EmptyState title="No published workshops" /> : null}
      <div className="grid gap-4 md:grid-cols-3">{query.data?.map((workshop) => <WorkshopCard key={workshop.id} workshop={workshop} />)}</div>
    </MainLayout>
  );
}
