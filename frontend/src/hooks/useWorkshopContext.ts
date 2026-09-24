import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export function useWorkshopContext(availableWorkshops: { id: string }[] | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();
  const workshopId = searchParams.get("workshopId");

  useEffect(() => {
    if (!workshopId && availableWorkshops && availableWorkshops.length > 0) {
      setSearchParams(
        (prev) => {
          prev.set("workshopId", availableWorkshops[0].id);
          return prev;
        },
        { replace: true }
      );
    }
  }, [workshopId, availableWorkshops, setSearchParams]);

  const setWorkshopId = (id: string) => {
    setSearchParams((prev) => {
      prev.set("workshopId", id);
      return prev;
    });
  };

  return { workshopId: workshopId || (availableWorkshops?.[0]?.id ?? ""), setWorkshopId };
}
