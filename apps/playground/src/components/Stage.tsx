import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createLoop, createRenderer, disposeScene } from '@threejs-journey/kit'
import type { LessonDefinition, LessonInstance } from '../types'

interface StageProps {
  lesson: LessonDefinition
}

/**
 * Bridges the imperative lesson lifecycle into React. The renderer and
 * animation loop are created once and survive every lesson switch; only the
 * active scene / camera is disposed and rebuilt when `lesson` changes.
 */
export function Stage({ lesson }: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uiRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const currentRef = useRef<LessonInstance | null>(null)

  // Persistent renderer + loop + resize handling (runs once per mount).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handle = createRenderer(container)
    rendererRef.current = handle.renderer

    const loop = createLoop(handle.renderer, (delta, elapsed) => {
      const instance = currentRef.current
      if (!instance) return
      instance.update?.(delta, elapsed)
      if (instance.render) instance.render()
      else handle.renderer.render(instance.scene, instance.camera)
    })

    const observer = new ResizeObserver(() => {
      const instance = currentRef.current
      if (!instance) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      if (instance.camera instanceof THREE.PerspectiveCamera) {
        instance.camera.aspect = width / height
        instance.camera.updateProjectionMatrix()
      }
      instance.resize?.(width, height)
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      const instance = currentRef.current
      if (instance) {
        instance.dispose?.()
        disposeScene(instance.scene)
        currentRef.current = null
      }
      loop.stop()
      rendererRef.current = null
      handle.dispose()
    }
  }, [])

  // Swap the mounted lesson whenever the active one changes.
  useEffect(() => {
    const container = containerRef.current
    const ui = uiRef.current
    const renderer = rendererRef.current
    if (!container || !ui || !renderer) return

    const previous = currentRef.current
    if (previous) {
      previous.dispose?.()
      disposeScene(previous.scene)
    }
    ui.replaceChildren()

    const width = container.clientWidth
    const height = container.clientHeight

    const instance = lesson.create({ container, ui, renderer, width, height })
    currentRef.current = instance

    // Fit the freshly created camera / scene to the current stage size.
    if (instance.camera instanceof THREE.PerspectiveCamera) {
      instance.camera.aspect = width / height
      instance.camera.updateProjectionMatrix()
    }
    instance.resize?.(width, height)
  }, [lesson])

  return (
    <section className="stage" ref={containerRef} aria-label="three.js canvas">
      <div className="stage-ui" ref={uiRef} />
      <div className="stage-hint">drag to orbit · scroll to zoom · ← → to switch lessons</div>
    </section>
  )
}
