import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/**
 * Damped orbit controls. Damping needs `controls.update()` every frame,
 * so lessons that use it should call it from their `update`.
 */
export function createOrbitControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
  target = new THREE.Vector3(),
): OrbitControls {
  const controls = new OrbitControls(camera, domElement)
  controls.target.copy(target)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.update()
  return controls
}
