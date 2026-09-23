import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { errorText } from "../../lib/errors";
import { api, unwrap } from "../../services/api";

export function AcademicProfilePage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["profile"], queryFn: () => unwrap<{ academicProfile?: { institution?: string; domain?: string; departmentName?: string; year?: number }; interests?: string[] }>(api.get("/profiles/me")) });
  const profile = query.data?.academicProfile;
  const [institution, setInstitution] = useState(profile?.institution ?? "");
  const [domain, setDomain] = useState(profile?.domain ?? "ENGINEERING");
  const [departmentName, setDepartmentName] = useState(profile?.departmentName ?? "");
  const [year, setYear] = useState(String(profile?.year ?? 1));
  const [interests, setInterests] = useState("");
  useEffect(() => {
    if (!query.data) return;
    setInstitution(query.data.academicProfile?.institution ?? "");
    setDomain(query.data.academicProfile?.domain ?? "ENGINEERING");
    setDepartmentName(query.data.academicProfile?.departmentName ?? "");
    setYear(String(query.data.academicProfile?.year ?? 1));
    setInterests((query.data.interests ?? []).join(", "));
  }, [query.data]);
  const mutation = useMutation({
    mutationFn: () =>
      unwrap(api.put("/profiles/me", {
        institution,
        domain,
        departmentName,
        year: Number(year),
        interests: interests.split(",").map((item) => item.trim()).filter(Boolean),
      })),
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile"] }),
  });
  return (
    <ParticipantLayout title="Academic profile">
      <form className="grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="Institution" value={institution} onChange={(event) => setInstitution(event.target.value)} required />
        <Select label="Domain" value={domain} onChange={(event) => setDomain(event.target.value)}>
          <option value="ENGINEERING">Engineering</option>
          <option value="ARTS_SCIENCE">Arts & Science</option>
          <option value="TAMIL_LANGUAGE">Tamil / Language</option>
          <option value="OTHER">Other</option>
        </Select>
        <Input label="Department" value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} />
        <Input label="Year" type="number" min={1} max={6} value={year} onChange={(event) => setYear(event.target.value)} />
        <Input label="Interests" value={interests} onChange={(event) => setInterests(event.target.value)} />
        {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
        <Button type="submit">Save profile</Button>
      </form>
    </ParticipantLayout>
  );
}
