import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/layout/MainLayout";
import { SearchBar } from "../../components/common/SearchBar";
import { Loader } from "../../components/common/Loader";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { WorkshopCard } from "../../components/workshops/WorkshopCard";
import { DomainMultiSelect, type DomainValue } from "../../components/common/DomainMultiSelect";
import { listWorkshops } from "../../services/workshop.service";
import { errorText } from "../../lib/errors";
import { useAuth } from "../../context/AuthContext";
import { api, unwrap } from "../../services/api";
import type { Workshop } from "../../types/workshop";

type Recommendation = { score: number; reasons: string[]; workshop: Workshop };

export function WorkshopsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const recommendedOnly = new URLSearchParams(location.search).get("recommended") === "true";

  useEffect(() => {
    if (recommendedOnly && !user) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate, recommendedOnly, user]);
  const [search, setSearch] = useState("");
  // appliedDomains = the committed filter (empty = All domains)
  const [appliedDomains, setAppliedDomains] = useState<DomainValue[]>([]);
  // pendingDomains = draft inside the multi-select before Apply
  const [pendingDomains, setPendingDomains] = useState<DomainValue[]>([]);

  // When multiple domains are selected the backend only supports a single
  // domain= param, so we fetch without a domain filter and apply client-side.
  // When exactly one domain is selected we pass it to the backend to let the
  // DB do the work; when zero (All) we also omit the param.
  const backendDomain =
    appliedDomains.length === 1 ? appliedDomains[0] : undefined;

  const query = useQuery({
    queryKey: ["workshops", search, backendDomain, appliedDomains.length],
    queryFn: () =>
      listWorkshops({ search: search || undefined, domain: backendDomain }),
  });

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", "workshops"],
    queryFn: () => unwrap<Recommendation[]>(api.get("/recommendations/me")),
    enabled: Boolean(user),
  });

  // Client-side OR filter for multi-domain case
  const displayed = useMemo(() => {
    if (!query.data) return [];
    if (appliedDomains.length <= 1) return query.data; // backend already handled it
    return query.data.filter((w) =>
      appliedDomains.includes(w.domain as DomainValue)
    );
  }, [query.data, appliedDomains]);

  const handleApply = (values: DomainValue[]) => {
    setAppliedDomains(values);
  };

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

        {user && recommendationsQuery.data && recommendationsQuery.data.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div>
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">Personalized discovery</span>
              <h2 className="font-serif text-2xl text-[#1A1412] mt-1">Recommended for you</h2>
              <p className="font-sans text-sm text-[#5F524B] mt-1">Sorted by your interests, department, and workshop relevance.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recommendationsQuery.data.map((item) => (
                <div key={item.workshop.id} className="relative">
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-[#1A1412] px-2.5 py-1 text-xs font-bold text-[#FFEDDB]">
                    {item.score}% match
                  </span>
                  <WorkshopCard workshop={item.workshop} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_280px] bg-[#FFFFFF] border border-[#DFC1B0] rounded-lg p-4 shadow-xs">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search title, topic, or instructor..."
          />
          <DomainMultiSelect
            selected={pendingDomains}
            onChange={setPendingDomains}
            onApply={handleApply}
          />
        </div>

        {query.isLoading ? <Loader /> : null}
        {query.isError ? <ErrorState message={errorText(query.error)} /> : null}
        {!query.isLoading && !query.isError && displayed.length === 0 ? (
          <EmptyState title="No published workshops found" />
        ) : null}

        <section className="flex flex-col gap-4">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#BF9270]">Full directory</span>
            <h2 className="font-serif text-2xl text-[#1A1412] mt-1">Explore all workshops</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {displayed.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}