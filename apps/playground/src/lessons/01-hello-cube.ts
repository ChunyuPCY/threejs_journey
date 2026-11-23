import * as THREE from 'three'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

export const helloCube: LessonDefinition = {
  id: 'hello-cube',
  title: 'Hello, cube',
  summary:
    'Every three.js app has the same three ingredients: a scene (the world), a camera (the eye) and a renderer (the paintbrush). Add a cube, then let the animation loop repaint it every frame.',
  concepts: ['Scene', 'PerspectiveCamera', 'WebGLRenderer', 'Animation loop'],

  create({ renderer }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0f16')
    scene.fog = new THREE.Fog('#0b0f16', 12, 26)

    const camera = createPerspectiveCamera([4.5, 3.5, 6.5])
    camera.lookAt(0, 0.9, 0)

    // Geometry = the shape's vertices. Material = how its surface reacts to light.
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 1.6),
      new THREE.MeshStandardMaterial({
        color: '#7dd3fc',
        roughness: 0.28,
        metalness: 0.15,
      }),
    )
    cube.position.y = 1.1
    cube.castShadow = true
    scene.add(cube)

    // A large plane under the cube, only there to catch the shadow.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#111722', roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(40, 40, '#2b3a50', '#18202d')
    grid.position.y = 0.002 // lift it slightly to avoid z-fighting with the floor
    scene.add(grid)

    // Hemisphere light: sky color from above, ground color from below.
    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1.1))

    // Directional light: parallel rays, like the sun. The only light casting shadows here.
    const sun = new THREE.DirectionalLight('#ffffff', 2.6)
    sun.position.set(5, 9, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1, 0))

    return {
      scene,
      camera,

      update(delta) {
        // Rotation is in radians. Multiplying by delta makes it frame-rate independent.
        cube.rotation.x += delta * 0.55
        cube.rotation.y += delta * 0.85
        controls.update()
      },

      dispose() {
        controls.dispose()
      },
    }
  },
}
