import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { TraceButton } from "../../components/trace/TraceButton";
import { errorText } from "../../lib/errors";
import { api, unwrap } from "../../services/api";

export function AcademicProfilePage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      unwrap<{
        academicProfile?: { institution?: string; domain?: string; departmentName?: string; year?: number };
        interests?: string[];
      }>(api.get("/profiles/me")),
  });

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
      unwrap(
        api.put("/profiles/me", {
          institution,
          domain,
          departmentName,
          year: Number(year),
          interests: interests.split(",").map((item) => item.trim()).filter(Boolean),
        })
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <ParticipantLayout title="Academic Record & Preferences">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <form
          className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-8 shadow-xs flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="border-b border-[#DFC1B0]/60 pb-4">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#BF9270]">
              Curricular Trajectory Settings
            </span>
            <h3 className="font-serif text-xl text-[#1A1412] font-semibold mt-0.5">
              Institution & Academic Affiliation
            </h3>
          </div>

          <Input
            label="Institution / University Name"
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
            required
          />

          <Select label="Academic Domain" value={domain} onChange={(event) => setDomain(event.target.value)}>
            <option value="ENGINEERING">Engineering & Technology</option>
            <option value="ARTS_SCIENCE">Arts & Science</option>
            <option value="TAMIL_LANGUAGE">Tamil & Language</option>
            <option value="OTHER">Interdisciplinary / Other</option>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department / Field of Study"
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
            />
            <Input
              label="Year of Study"
              type="number"
              min={1}
              max={6}
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>

          <Input
            label="Research & Topic Interests (comma-separated)"
            placeholder="e.g. Distributed Systems, Cybersecurity, AI Ethics"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
          />

          {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
          {mutation.isSuccess ? (
            <div className="p-3 bg-[#FFEDDB] border border-[#BF9270] rounded-lg text-xs font-semibold text-[#1A1412] text-center">
              Academic profile saved successfully!
            </div>
          ) : null}

          <div className="pt-2">
            <TraceButton type="submit" disabled={mutation.isPending} icon="save">
              {mutation.isPending ? "Saving Changes..." : "Save Academic Profile"}
            </TraceButton>
          </div>
        </form>
      </div>
    </ParticipantLayout>
  );
}
