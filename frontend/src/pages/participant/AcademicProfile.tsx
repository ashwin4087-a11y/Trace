import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { Select } from "../../components/common/Select";
import { errorText } from "../../lib/errors";
import { getProfile, getProfileOptions, updateProfile } from "../../services/profile.service";

type Domain = "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "INTERDISCIPLINARY" | "OTHER";
type Year = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "POSTGRADUATE" | "WORKING_PROFESSIONAL" | "OTHER";
type AcademicLanguage = "ENGLISH" | "TAMIL" | "TAMIL_ENGLISH";

export function AcademicProfilePage() {
  const client = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [organizationId, setOrganizationId] = useState("");
  const optionsQuery = useQuery({ queryKey: ["profile-options", organizationId], queryFn: () => getProfileOptions(organizationId || undefined) });
  const [form, setForm] = useState<{ institution: string; domain: Domain; year: Year; academicPreferredLanguage: AcademicLanguage; departmentId: string; skills: string; interests: string }>({
    institution: "", domain: "ENGINEERING", year: "OTHER", academicPreferredLanguage: "ENGLISH", departmentId: "", skills: "", interests: "",
  });
  const mutation = useMutation({
    mutationFn: () => updateProfile({
      institution: form.institution,
      domain: form.domain,
      year: form.year,
      academicPreferredLanguage: form.academicPreferredLanguage,
      organizationId: organizationId || null,
      departmentId: form.departmentId || null,
      departmentName: optionsQuery.data?.departments.find((department) => department.id === form.departmentId)?.name,
      skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
      interests: form.interests.split(",").map((item) => item.trim()).filter(Boolean),
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile"] }),
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setOrganizationId(profile.user.organization?.id ?? "");
    setForm({
      institution: profile.academicProfile?.institution ?? "",
      domain: (profile.academicProfile?.domain as Domain) ?? "ENGINEERING",
      year: (profile.academicProfile?.year as Year) ?? "OTHER",
      academicPreferredLanguage: profile.academicProfile?.preferredLanguage ?? "ENGLISH",
      departmentId: profile.user.department?.id ?? "",
      skills: profile.skills.map((skill) => skill.name).join(", "),
      interests: profile.interests.join(", "),
    });
  }, [profileQuery.data]);

  return (
    <ParticipantLayout title="Academic profile">
      {profileQuery.isLoading ? <Loader label="Loading academic profile" /> : null}
      {profileQuery.isError ? <ErrorState message="Unable to load your academic profile." /> : null}
      {profileQuery.data ? <form className="grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="Institution" value={form.institution} onChange={(event) => setForm({ ...form, institution: event.target.value })} required />
        <Select label="Organization" value={organizationId} onChange={(event) => { setOrganizationId(event.target.value); setForm({ ...form, departmentId: "" }); }}>
          <option value="">Independent / not specified</option>
          {optionsQuery.data?.organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
        </Select>
        <Select label="Department" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} disabled={!organizationId}>
          <option value="">Independent / not specified</option>
          {optionsQuery.data?.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
        </Select>
        <Select label="Domain" value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value as Domain })}>
          <option value="ENGINEERING">Engineering</option><option value="ARTS_SCIENCE">Arts &amp; Science</option><option value="TAMIL_LANGUAGE">Tamil-Language</option><option value="INTERDISCIPLINARY">Interdisciplinary</option><option value="OTHER">Other</option>
        </Select>
        <Select label="Year" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value as Year })}>
          <option value="FIRST">1st</option><option value="SECOND">2nd</option><option value="THIRD">3rd</option><option value="FOURTH">4th</option><option value="POSTGRADUATE">Postgraduate</option><option value="WORKING_PROFESSIONAL">Working Professional</option><option value="OTHER">Other</option>
        </Select>
        <Select label="Preferred language" value={form.academicPreferredLanguage} onChange={(event) => setForm({ ...form, academicPreferredLanguage: event.target.value as AcademicLanguage })}>
          <option value="ENGLISH">English</option><option value="TAMIL">Tamil</option><option value="TAMIL_ENGLISH">Tamil + English</option>
        </Select>
        <Input label="Skills" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Comma-separated skills" />
        <Input label="Interests" value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Comma-separated interests" />
        {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
        {mutation.isSuccess ? <p className="text-sm text-success">Academic profile saved.</p> : null}
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save academic profile"}</Button>
      </form> : null}
    </ParticipantLayout>
  );
}
