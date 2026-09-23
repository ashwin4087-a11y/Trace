import type { LearningPath } from "../../types/learning-path";

export function PathCard({ path, progress }: { path: LearningPath; progress?: string }) {
  return (
    <article className="rounded-lg border border-line bg-card p-4">
      <h3 className="font-bold">{path.title}</h3>
      <p className="text-sm text-ink/70">{path.description}</p>
      {progress ? <p className="mt-2 text-sm">{progress}</p> : null}
      <ol className="mt-2 list-decimal pl-5 text-sm">
        {path.steps?.map((step) => <li key={step.workshop.id}>{step.workshop.title}</li>)}
      </ol>
    </article>
  );
}
