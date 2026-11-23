import type * as THREE from 'three'

export interface LessonContext {
  /** The element the renderer canvas fills. */
  container: HTMLElement
  /** An absolutely positioned overlay inside the stage, for GUI/hints. */
  ui: HTMLElement
  renderer: THREE.WebGLRenderer
  width: number
  height: number
}

export interface LessonInstance {
  scene: THREE.Scene
  camera: THREE.Camera
  /** Called once per frame before rendering. */
  update?: (delta: number, elapsed: number) => void
  /** Called when the stage is resized, after the camera aspect is updated. */
  resize?: (width: number, height: number) => void
  /** Replace the default `renderer.render(scene, camera)` (e.g. a composer). */
  render?: () => void
  /** Clean up controls, event listeners, GUI, ... The scene is disposed for you. */
  dispose?: () => void
}

export interface LessonDefinition {
  id: string
  title: string
  summary: string
  concepts: string[]
  create: (context: LessonContext) => LessonInstance
}
