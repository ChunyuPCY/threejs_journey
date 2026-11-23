import { Link } from "react-router";
import { lessons } from "../lessons";

const firstLesson = lessons[0]?.id ?? "";

export function NotFound() {
  return (
    <div className="shell">
      <main className="main">
        <header className="lesson-header">
          <div className="eyebrow">
            <span className="lesson-count">404</span>
            <span className="eyebrow-sep">/</span>
            <span>learn three.js</span>
          </div>
          <h1 className="lesson-title">No such lesson</h1>
          <p className="lesson-summary">
            That route does not match a lesson.{" "}
            <Link to={`/lesson/${firstLesson}`}>Back to the first lesson</Link>.
          </p>
        </header>
      </main>
    </div>
  );
}
