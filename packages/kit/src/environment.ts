import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Bakes a small "photo studio" into a PMREM environment map. This is what
 * makes metal and glass look reflective without loading an HDR file.
 *
 * Remember to dispose the returned texture when the scene is torn down
 * (`disposeScene` does it for you).
 */
export function addRoomEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  intensity = 1,
): THREE.Texture {
  const generator = new THREE.PMREMGenerator(renderer)
  const texture = generator.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = texture
  scene.environmentIntensity = intensity
  generator.dispose()
  return texture
}
