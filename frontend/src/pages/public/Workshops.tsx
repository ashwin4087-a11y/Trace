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
      <div className="flex flex-col gap-6">
        <div>
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">
            Curricular Directory
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1412] font-normal mt-1">
            Discover Workshops
          </h1>
          <p className="font-sans text-sm text-[#5F524B] mt-1">
            Browse accredited courses, hands-on seminars, and lifelong learning tracks across departments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_240px] bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-4 shadow-xs">
          <SearchBar value={search} onChange={setSearch} placeholder="Search title, topic, or instructor..." />
          <Select label="Domain" value={domain} onChange={(event) => setDomain(event.target.value)}>
            <option value="">All domains</option>
            <option value="ENGINEERING">Engineering & Technology</option>
            <option value="ARTS_SCIENCE">Arts & Science</option>
            <option value="TAMIL_LANGUAGE">Tamil & Language</option>
            <option value="OTHER">Interdisciplinary</option>
          </Select>
        </div>

        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
        {query.data && query.data.length === 0 ? <EmptyState title="No published workshops found" /> : null}

        <div className="grid gap-6 md:grid-cols-3">
          {query.data?.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
