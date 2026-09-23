import type { SkillPassport } from "../../types/skill";

export function PassportList({ passport }: { passport: SkillPassport }) {
  return (
    <div className="space-y-3">
      {passport.skills.map((item) => (
        <p key={item.skill.name} className="text-sm">{item.skill.name} · {item.level}{item.verified ? " · verified" : ""}</p>
      ))}
      {passport.certificates.map((item) => (
        <p key={item.certificateCode} className="text-sm">Evidence: {item.workshop.title} ({item.certificateCode})</p>
      ))}
    </div>
  );
}
