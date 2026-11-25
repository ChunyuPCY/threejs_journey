import * as THREE from 'three'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

const COLORS = [
  '#38bdf8',
  '#a78bfa',
  '#f472b6',
  '#fbbf24',
  '#34d399',
  '#22d3ee',
  '#fb7185',
  '#c084fc',
]

export const transforms: LessonDefinition = {
  id: 'transforms',
  title: 'Position, rotation, scale',
  summary:
    'A scene is a tree, not a list. Every object has a local transform relative to its parent, and a group transform moves all of its children together. This is the whole foundation of building hierarchies.',
  concepts: ['Object3D', 'Group', 'local vs world space', 'parenting'],

  create({ renderer }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0f16')
    scene.fog = new THREE.Fog('#0b0f16', 14, 30)

    const camera = createPerspectiveCamera([0, 5.5, 11])
    camera.lookAt(0, 1.2, 0)

    // Rotating this group rotates every child around the origin.
    const ring = new THREE.Group()
    scene.add(ring)

    const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)
    const cubes: THREE.Mesh[] = []

    for (let index = 0; index < COLORS.length; index += 1) {
      const angle = (index / COLORS.length) * Math.PI * 2
      const cube = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: COLORS[index],
          roughness: 0.35,
          metalness: 0.25,
        }),
      )

      // Polar coordinates: place the cubes evenly on a circle.
      cube.position.set(Math.cos(angle) * 3.1, 1, Math.sin(angle) * 3.1)
      cube.rotation.y = -angle
      cube.castShadow = true
      ring.add(cube)
      cubes.push(cube)
    }

    // A child of the first cube: it inherits that cube's position and rotation,
    // then applies its own local offset on top.
    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 16),
      new THREE.MeshStandardMaterial({
        color: '#fca5a5',
        emissive: '#7f1d1d',
        emissiveIntensity: 0.6,
      }),
    )
    satellite.position.set(0, 0.85, 0)
    cubes[0]?.add(satellite)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#111722', roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(40, 40, '#2b3a50', '#18202d'))

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1.2))
    const sun = new THREE.DirectionalLight('#ffffff', 2.6)
    sun.position.set(6, 10, 7)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1, 0))

    return {
      scene,
      camera,

      update(delta, elapsed) {
        // World-space rotation of the parent.
        ring.rotation.y += delta * 0.35

        // Local-space animation: each cube bobs and twists on its own.
        cubes.forEach((cube, index) => {
          cube.position.y = 1 + Math.sin(elapsed * 1.6 + index) * 0.18
          cube.rotation.x += delta * 0.4
          const pulse = 1 + Math.sin(elapsed * 2 + index * 0.8) * 0.06
          cube.scale.setScalar(pulse)
        })

        controls.update()
      },

      dispose() {
        controls.dispose()
      },
    }
  },
}
