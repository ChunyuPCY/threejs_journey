import { Link, NavLink } from 'react-router'
import { lessons } from '../lessons'
import { pad } from '../lib/format'

const firstLesson = lessons[0]?.id ?? ''

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" to={`/lesson/${firstLesson}`}>
        <span className="brand-mark">◈</span>
        <span className="brand-text">
          <strong>three.js Journey</strong>
          <small>monorepo playground</small>
        </span>
      </Link>

      <nav className="lesson-nav" aria-label="Lessons">
        {lessons.map((lesson, index) => (
          <NavLink
            key={lesson.id}
            className={({ isActive }) => `lesson-link${isActive ? ' active' : ''}`}
            to={`/lesson/${lesson.id}`}
          >
            <span className="lesson-number">{pad(index + 1)}</span>
            <span className="lesson-link-text">
              <strong>{lesson.title}</strong>
              <small>{lesson.concepts[0] ?? ''}</small>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <code>pnpm dev</code>
        <span>
          Every lesson is a small module.
          <br />
          Read it, then break it.
        </span>
      </div>
    </aside>
  )
}
