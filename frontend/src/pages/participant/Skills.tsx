import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParticipantLayout } from "../../components/layout/ParticipantLayout";
import { PassportList } from "../../components/skills/PassportList";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { addSkill, passport } from "../../services/skill.service";

export function SkillsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["passport"], queryFn: passport });
  const [name, setName] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const mutation = useMutation({
    mutationFn: () => addSkill(name, level),
    onSuccess: () => client.invalidateQueries({ queryKey: ["passport"] }),
  });
  return (
    <ParticipantLayout title="Skill passport">
      {query.data ? <PassportList passport={query.data} /> : null}
      <form className="mt-4 grid max-w-md gap-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
        <Input label="Skill" value={name} onChange={(event) => setName(event.target.value)} required />
        <Select label="Level" value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Button type="submit">Add skill</Button>
      </form>
    </ParticipantLayout>
  );
}
