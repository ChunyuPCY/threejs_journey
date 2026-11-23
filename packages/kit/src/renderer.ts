import * as THREE from 'three'

export interface RendererHandle {
  renderer: THREE.WebGLRenderer
  /** Re-read the container size. */
  resize: () => void
  dispose: () => void
}

/**
 * Creates the renderer once and keeps its drawing buffer in sync with the
 * container. The canvas is absolutely positioned so overlays can sit on top.
 */
export function createRenderer(container: HTMLElement): RendererHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  })

  // Cap the pixel ratio: retina displays at 3x are expensive with no real gain.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.className = 'stage-canvas'
  container.appendChild(renderer.domElement)

  const resize = () => {
    const { clientWidth, clientHeight } = container
    if (clientWidth === 0 || clientHeight === 0) return
    renderer.setSize(clientWidth, clientHeight, false)
  }

  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(container)

  return {
    renderer,
    resize,
    dispose: () => {
      observer.disconnect()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
