import { lessons } from "../lessons";
import { pad } from "../lib/format";
import type { LessonDefinition } from "../types";

interface LessonHeaderProps {
  lesson: LessonDefinition;
  index: number;
}

export function LessonHeader({ lesson, index }: LessonHeaderProps) {
  return (
    <header className="lesson-header">
      <div className="eyebrow">
        <span className="lesson-count">{`${pad(index + 1)} / ${pad(lessons.length)}`}</span>
        <span className="eyebrow-sep">/</span>
        <span>learn three.js</span>
      </div>
      <h1 className="lesson-title">{lesson.title}</h1>
      <p className="lesson-summary">{lesson.summary}</p>
      <ul className="concepts">
        {lesson.concepts.map((concept) => (
          <li key={concept}>{concept}</li>
        ))}
      </ul>
    </header>
  );
}
