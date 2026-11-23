import * as THREE from 'three'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

const shapes: Array<[name: string, geometry: THREE.BufferGeometry]> = [
  ['BoxGeometry', new THREE.BoxGeometry(1.1, 1.1, 1.1)],
  ['SphereGeometry', new THREE.SphereGeometry(0.7, 40, 24)],
  ['ConeGeometry', new THREE.ConeGeometry(0.65, 1.3, 40)],
  ['CylinderGeometry', new THREE.CylinderGeometry(0.55, 0.55, 1.15, 40)],
  ['TorusGeometry', new THREE.TorusGeometry(0.52, 0.21, 20, 72)],
  ['TorusKnotGeometry', new THREE.TorusKnotGeometry(0.46, 0.15, 140, 20)],
  ['IcosahedronGeometry', new THREE.IcosahedronGeometry(0.75, 0)],
  ['DodecahedronGeometry', new THREE.DodecahedronGeometry(0.72, 0)],
]

export const geometries: LessonDefinition = {
  id: 'geometries',
  title: 'Geometry is just data',
  summary:
    'A geometry stores vertex positions, normals and UVs. A material decides how that data is drawn. Swap geometries on the same material and you get completely different objects — no modelling tool required.',
  concepts: ['BufferGeometry', 'vertices & faces', 'UVs', 'procedural shapes'],

  create({ renderer }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0f16')
    scene.fog = new THREE.Fog('#0b0f16', 16, 32)

    const camera = createPerspectiveCamera([0, 5.2, 9.5])
    camera.lookAt(0, 1.3, 0)

    const meshes: Array<{ mesh: THREE.Mesh; baseY: number }> = []

    shapes.forEach(([, geometry], index) => {
      const column = index % 4
      const row = Math.floor(index / 4)
      const color = new THREE.Color().setHSL(index / shapes.length, 0.68, 0.62)

      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.3,
          metalness: 0.35,
          flatShading: index >= 6, // low-poly shapes look better faceted
        }),
      )

      mesh.position.set((column - 1.5) * 2.5, 1.6, (row - 0.5) * 3)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
      meshes.push({ mesh, baseY: mesh.position.y })
    })

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#111722', roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(40, 40, '#2b3a50', '#18202d'))

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1.2))
    const sun = new THREE.DirectionalLight('#ffffff', 2.5)
    sun.position.set(6, 10, 7)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1.4, 0))

    return {
      scene,
      camera,

      update(delta, elapsed) {
        meshes.forEach(({ mesh, baseY }, index) => {
          mesh.rotation.y += delta * (0.35 + index * 0.04)
          mesh.rotation.x += delta * 0.12
          mesh.position.y = baseY + Math.sin(elapsed * 1.2 + index) * 0.12
        })
        controls.update()
      },

      dispose() {
        controls.dispose()
      },
    }
  },
}
