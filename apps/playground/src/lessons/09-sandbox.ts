import * as THREE from 'three'
import GUI from 'lil-gui'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

export const sandbox: LessonDefinition = {
  id: 'sandbox',
  title: 'Sandbox',
  summary:
    'The training wheels are off. This is the same skeleton as lesson one, with nothing to explain. Open apps/playground/src/lessons/09-sandbox.ts and change something: add a second mesh, swap the geometry, animate the light, break the camera. That is how the rest of three.js is learned.',
  concepts: ['your turn', 'experiment', 'read the source'],

  create({ renderer, ui }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#080b11')
    scene.fog = new THREE.Fog('#080b11', 12, 28)

    const camera = createPerspectiveCamera([4.5, 3.5, 6.5])
    camera.lookAt(0, 1, 0)

    const material = new THREE.MeshStandardMaterial({
      color: '#7dd3fc',
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false,
    })

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), material)
    cube.position.y = 1.1
    cube.castShadow = true
    scene.add(cube)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#10151f', roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(40, 40, '#263449', '#141b26'))

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1.1))
    const sun = new THREE.DirectionalLight('#ffffff', 2.5)
    sun.position.set(5, 9, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const state = {
      color: '#7dd3fc',
      speed: 0.8,
      roughness: 0.3,
      wireframe: false,
    }

    const gui = new GUI({ container: ui, title: 'Sandbox' })
    gui.addColor(state, 'color').onChange((value: string) => {
      material.color.set(value)
    })
    gui.add(state, 'speed', 0, 3, 0.01)
    gui.add(state, 'roughness', 0, 1, 0.01).onChange((value: number) => {
      material.roughness = value
    })
    gui.add(state, 'wireframe').onChange((value: boolean) => {
      material.wireframe = value
    })

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1, 0))

    return {
      scene,
      camera,

      update(delta) {
        cube.rotation.x += delta * state.speed * 0.55
        cube.rotation.y += delta * state.speed * 0.85
        controls.update()
      },

      dispose() {
        gui.destroy()
        controls.dispose()
      },
    }
  },
}
