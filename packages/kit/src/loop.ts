import * as THREE from 'three'

export type LoopCallback = (delta: number, elapsed: number) => void

/**
 * Wraps `renderer.setAnimationLoop`. `delta` is the time since the previous
 * frame in seconds (clamped so a background tab doesn't jump the animation),
 * `elapsed` is the total running time in seconds.
 */
export function createLoop(
  renderer: THREE.WebGLRenderer,
  callback: LoopCallback,
): { stop: () => void } {
  const clock = new THREE.Clock()
  let elapsed = 0

  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.1)
    elapsed += delta
    callback(delta, elapsed)
  })

  return {
    stop: () => renderer.setAnimationLoop(null),
  }
}
