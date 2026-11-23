import * as THREE from 'three'

/** A perspective camera looking at the origin, with a 1:1 aspect until resized. */
export function createPerspectiveCamera(
  position: [number, number, number],
  fov = 45,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 1000)
  camera.position.set(...position)
  camera.lookAt(0, 0, 0)
  return camera
}
