import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { lessons } from '../lessons'
import { LessonHeader } from './LessonHeader'
import { Pager } from './Pager'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'

export function LessonScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const index = lessons.findIndex((lesson) => lesson.id === id)
  const lesson = index >= 0 ? lessons[index] : undefined
  const firstLesson = lessons[0]?.id ?? ''

  // Keep the ← / → shortcuts in sync with the ordered lesson list.
  useEffect(() => {
    if (!lesson) return

    function onKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (target?.closest('input, select, textarea, .lil-gui')) return

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        void navigate(`/lesson/${lessons[index - 1].id}`)
      } else if (event.key === 'ArrowRight' && index < lessons.length - 1) {
        event.preventDefault()
        void navigate(`/lesson/${lessons[index + 1].id}`)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, lesson, navigate])

  useEffect(() => {
    if (lesson) document.title = `${lesson.title} · three.js Journey`
  }, [lesson])

  // Unknown id: send the learner back to the first lesson.
  if (!lesson) return <Navigate to={`/lesson/${firstLesson}`} replace />

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <LessonHeader lesson={lesson} index={index} />
        <Stage lesson={lesson} />
        <Pager index={index} />
      </main>
    </div>
  )
}
