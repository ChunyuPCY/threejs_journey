import * as THREE from 'three'

/** Releases geometries, materials and every texture referenced by a material. */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    mesh.geometry?.dispose()

    if (!mesh.material) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

/** Disposes a whole scene, including the environment map and texture background. */
export function disposeScene(scene: THREE.Scene): void {
  disposeObject(scene)
  scene.environment?.dispose()
  if (scene.background instanceof THREE.Texture) scene.background.dispose()
  scene.clear()
}
