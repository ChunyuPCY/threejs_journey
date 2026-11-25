import * as THREE from 'three'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

type Cube = THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>

export const interaction: LessonDefinition = {
  id: 'interaction',
  title: 'Picking with a ray',
  summary:
    'The mouse is 2D, the scene is 3D. A raycaster turns a screen position into a ray, then tests that ray against meshes. It is the basis of every hover effect, selection tool and clickable object in three.js.',
  concepts: ['Raycaster', 'NDC coordinates', 'pointer events', 'userData'],

  create({ renderer, ui }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#080b11')
    scene.fog = new THREE.Fog('#080b11', 14, 28)

    const camera = createPerspectiveCamera([0, 7.5, 10])
    camera.lookAt(0, 0.8, 0)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#10151f', roughness: 0.9 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(40, 40, '#263449', '#141b26'))

    const cubes: Cube[] = []
    const gridSize = 5
    const spacing = 1.65

    for (let row = 0; row < gridSize; row += 1) {
      for (let column = 0; column < gridSize; column += 1) {
        const cube: Cube = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
            color: '#1e293b',
            roughness: 0.4,
            metalness: 0.3,
            emissive: '#0ea5e9',
            emissiveIntensity: 0,
          }),
        )

        cube.position.set(
          (column - (gridSize - 1) / 2) * spacing,
          0.5,
          (row - (gridSize - 1) / 2) * spacing,
        )
        cube.castShadow = true
        cube.receiveShadow = true
        cube.userData.selected = false
        scene.add(cube)
        cubes.push(cube)
      }
    }

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1))
    const sun = new THREE.DirectionalLight('#ffffff', 2.4)
    sun.position.set(6, 10, 7)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const hint = document.createElement('div')
    hint.className = 'stage-note'
    hint.textContent = 'Hover a cube to highlight it. Click to pin it in the air.'
    ui.appendChild(hint)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(-10, -10)
    let hovered: Cube | null = null
    let pointerDownAt: { x: number; y: number } | null = null

    const canvas = renderer.domElement
    canvas.style.cursor = 'grab'

    function updatePointer(event: PointerEvent): void {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    function pick(): Cube | null {
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(cubes, false)[0]
      return (hit?.object as Cube | undefined) ?? null
    }

    function setHovered(cube: Cube | null): void {
      if (hovered === cube) return

      if (hovered) {
        hovered.material.emissiveIntensity = hovered.userData.selected ? 0.45 : 0
      }

      hovered = cube
      if (hovered) hovered.material.emissiveIntensity = 0.9
      canvas.style.cursor = hovered ? 'pointer' : 'grab'
    }

    function onPointerMove(event: PointerEvent): void {
      updatePointer(event)
      setHovered(pick())
    }

    function onPointerDown(event: PointerEvent): void {
      pointerDownAt = { x: event.clientX, y: event.clientY }
    }

    function onPointerUp(event: PointerEvent): void {
      if (event.button !== 0 || !pointerDownAt) return

      // Ignore the pointerup at the end of an orbit drag.
      const moved = Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y)
      pointerDownAt = null
      if (moved > 5) return

      updatePointer(event)
      const cube = pick()
      if (!cube) return

      const selected = !cube.userData.selected
      cube.userData.selected = selected
      cube.material.color.set(selected ? '#38bdf8' : '#1e293b')
      cube.material.emissiveIntensity = selected ? 0.9 : 0
    }

    function onPointerLeave(): void {
      setHovered(null)
      pointer.set(-10, -10)
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 0.8, 0))

    return {
      scene,
      camera,

      update(delta) {
        cubes.forEach((cube) => {
          const targetY = cube.userData.selected ? 1.5 : 0.5
          cube.position.y = THREE.MathUtils.damp(cube.position.y, targetY, 7, delta)
          cube.rotation.y = THREE.MathUtils.damp(
            cube.rotation.y,
            cube.userData.selected ? Math.PI / 4 : 0,
            7,
            delta,
          )
        })
        controls.update()
      },

      dispose() {
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointerup', onPointerUp)
        canvas.removeEventListener('pointerleave', onPointerLeave)
        canvas.style.cursor = ''
        controls.dispose()
      },
    }
  },
}
