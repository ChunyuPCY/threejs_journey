import * as THREE from 'three'
import GUI from 'lil-gui'
import {
  addRoomEnvironment,
  createOrbitControls,
  createPerspectiveCamera,
} from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

export const materials: LessonDefinition = {
  id: 'materials',
  title: 'Materials & reflections',
  summary:
    'The same sphere, six different materials. Basic ignores light, Lambert is cheap diffuse, Phong adds a highlight, Standard is physically based, Physical adds a clear coat, and Normal visualises the surface direction. Metals need an environment to reflect.',
  concepts: ['MeshStandardMaterial', 'metalness & roughness', 'environment map', 'PBR'],

  create({ renderer, ui }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#080b11')
    scene.fog = new THREE.Fog('#080b11', 16, 30)

    const camera = createPerspectiveCamera([0, 2.8, 8.5])
    camera.lookAt(0, 1.25, 0)

    // Bake a studio environment so metal and glass have something to reflect.
    addRoomEnvironment(renderer, scene, 1.1)

    const geometry = new THREE.SphereGeometry(0.8, 64, 40)
    const variants: Array<[string, THREE.Material]> = [
      ['MeshBasicMaterial', new THREE.MeshBasicMaterial({ color: '#38bdf8' })],
      ['MeshLambertMaterial', new THREE.MeshLambertMaterial({ color: '#a78bfa' })],
      ['MeshPhongMaterial', new THREE.MeshPhongMaterial({ color: '#f472b6', shininess: 90 })],
      [
        'MeshStandardMaterial',
        new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.95, roughness: 0.18 }),
      ],
      [
        'MeshPhysicalMaterial',
        new THREE.MeshPhysicalMaterial({
          color: '#22d3ee',
          metalness: 0.25,
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
        }),
      ],
      ['MeshNormalMaterial', new THREE.MeshNormalMaterial()],
    ]

    const spheres: THREE.Mesh[] = []
    variants.forEach(([, material], index) => {
      const column = index % 3
      const row = Math.floor(index / 3)
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set((column - 1) * 2.5, row === 0 ? 2.1 : 0.85, 0)
      sphere.castShadow = true
      sphere.receiveShadow = true
      scene.add(sphere)
      spheres.push(sphere)
    })

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#10151f', roughness: 0.75, metalness: 0.2 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(40, 40, '#27354a', '#141b26'))

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 0.6))
    const sun = new THREE.DirectionalLight('#ffffff', 2)
    sun.position.set(5, 9, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const standard = variants[3]?.[1] as THREE.MeshStandardMaterial
    const gui = new GUI({ container: ui, title: 'MeshStandardMaterial' })
    gui.add(standard, 'metalness', 0, 1, 0.01)
    gui.add(standard, 'roughness', 0, 1, 0.01)

    const environment = { intensity: scene.environmentIntensity }
    gui
      .add(environment, 'intensity', 0, 3, 0.01)
      .name('env intensity')
      .onChange((value: number) => {
        scene.environmentIntensity = value
      })

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1.25, 0))

    return {
      scene,
      camera,

      update(delta) {
        // Slow rotation makes the reflections slide across the metal surfaces.
        spheres.forEach((sphere, index) => {
          sphere.rotation.y += delta * (0.15 + index * 0.03)
        })
        controls.update()
      },

      dispose() {
        gui.destroy()
        controls.dispose()
      },
    }
  },
}
