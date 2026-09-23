import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { Input } from "../../components/common/Input";
import { Loader } from "../../components/common/Loader";
import { errorText } from "../../lib/errors";
import { getProfile, updateProfile } from "../../services/profile.service";

export function ProfilePage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [form, setForm] = useState({ name: "", phone: "", firstName: "", lastName: "", institution: "" });
  const mutation = useMutation({
    mutationFn: () => updateProfile({
      ...form,
      name: form.name || null,
      phone: form.phone || null,
      domain: (query.data?.academicProfile?.domain as "ENGINEERING" | "ARTS_SCIENCE" | "TAMIL_LANGUAGE" | "INTERDISCIPLINARY" | "OTHER") ?? "OTHER",
      year: (query.data?.academicProfile?.year as "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "POSTGRADUATE" | "WORKING_PROFESSIONAL" | "OTHER") ?? "OTHER",
      academicPreferredLanguage: query.data?.academicProfile?.preferredLanguage ?? "ENGLISH",
      interests: query.data?.interests ?? [],
      skills: query.data?.skills.map((skill) => skill.name) ?? [],
      organizationId: query.data?.user.organization?.id ?? null,
      departmentId: query.data?.user.department?.id ?? null,
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile"] }),
  });

  useEffect(() => {
    if (!query.data) return;
    setForm({
      name: query.data.user.name ?? `${query.data.user.firstName} ${query.data.user.lastName}`,
      phone: query.data.user.phone ?? "",
      firstName: query.data.user.firstName,
      lastName: query.data.user.lastName,
      institution: query.data.academicProfile?.institution ?? "",
    });
  }, [query.data]);

  return (
    <ParticipantLayout title="Profile">
      {query.isLoading ? <Loader label="Loading profile" /> : null}
      {query.isError ? <ErrorState message="Unable to load your profile." /> : null}
      {query.data ? <form className="grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
        <Input label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
        <Input label="Email" value={query.data.user.email} disabled />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="Institution" value={form.institution} onChange={(event) => setForm({ ...form, institution: event.target.value })} required />
        {mutation.isError ? <ErrorState message={errorText(mutation.error)} /> : null}
        {mutation.isSuccess ? <p className="text-sm text-success">Profile saved.</p> : null}
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save profile"}</Button>
      </form> : null}
    </ParticipantLayout>
  );
}
