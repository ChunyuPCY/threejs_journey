import { useNavigate } from "react-router";
import { lessons } from "../lessons";
import { pad } from "../lib/format";

interface PagerProps {
  index: number;
}

export function Pager({ index }: PagerProps) {
  const navigate = useNavigate();
  const total = lessons.length;
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  function goTo(target: number): void {
    const lesson = lessons[target];
    if (lesson) navigate(`/lesson/${lesson.id}`);
  }

  return (
    <footer className="pager">
      <button
        className="pager-button"
        type="button"
        disabled={atStart}
        onClick={() => goTo(index - 1)}
      >
        ← Previous
      </button>
      <span className="pager-status">{`Lesson ${pad(index + 1)} of ${pad(total)}`}</span>
      <button
        className="pager-button"
        type="button"
        disabled={atEnd}
        onClick={() => goTo(index + 1)}
      >
        Next →
      </button>
    </footer>
  );
}
