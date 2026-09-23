export function QuestionList({ questions }: { questions: { id: string; prompt: string; options?: string[] | null }[] }) {
  return (
    <ol className="space-y-3 text-sm">
      {questions.map((question, index) => (
        <li key={question.id}>
          <p className="font-semibold">{index + 1}. {question.prompt}</p>
          <ul>{question.options?.map((option) => <li key={option}>{option}</li>)}</ul>
        </li>
      ))}
    </ol>
  );
}
