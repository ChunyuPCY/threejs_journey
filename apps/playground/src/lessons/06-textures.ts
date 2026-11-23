import * as THREE from 'three'
import GUI from 'lil-gui'
import {
  createCanvasTexture,
  createOrbitControls,
  createPerspectiveCamera,
} from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

const wraps: Record<string, THREE.Wrapping> = {
  Repeat: THREE.RepeatWrapping,
  Clamp: THREE.ClampToEdgeWrapping,
  Mirrored: THREE.MirroredRepeatWrapping,
}

export const textures: LessonDefinition = {
  id: 'textures',
  title: 'Textures & UVs',
  summary:
    'A texture is just an image mapped onto a mesh through UV coordinates — a 0..1 coordinate system stored per vertex. The checker below is drawn into a 2D canvas, so there is no image file involved. Tweak the repeat and wrap mode to see how UVs behave.',
  concepts: ['CanvasTexture', 'UV coordinates', 'wrapping & repeat', 'colorSpace'],

  create({ renderer, ui }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#080b11')
    scene.fog = new THREE.Fog('#080b11', 16, 30)

    const camera = createPerspectiveCamera([6.5, 4.5, 8])
    camera.lookAt(0, 1, 0)

    // Draw a checkerboard with a few markers that reveal orientation and tiling.
    const checker = createCanvasTexture(512, (context, size) => {
      const cells = 8
      const cell = size / cells

      context.fillStyle = '#0d1521'
      context.fillRect(0, 0, size, size)

      for (let y = 0; y < cells; y += 1) {
        for (let x = 0; x < cells; x += 1) {
          if ((x + y) % 2 === 0) {
            context.fillStyle = '#1b3350'
            context.fillRect(x * cell, y * cell, cell, cell)
          }
        }
      }

      context.strokeStyle = 'rgba(56, 189, 248, 0.45)'
      context.lineWidth = 2
      for (let index = 0; index <= cells; index += 1) {
        context.beginPath()
        context.moveTo(index * cell, 0)
        context.lineTo(index * cell, size)
        context.stroke()
        context.beginPath()
        context.moveTo(0, index * cell)
        context.lineTo(size, index * cell)
        context.stroke()
      }

      // An "F" makes it obvious where the texture is flipped or mirrored.
      context.fillStyle = '#7dd3fc'
      context.font = 'bold 96px ui-monospace, monospace'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText('F', size / 2, size / 2)
    })

    checker.wrapS = THREE.RepeatWrapping
    checker.wrapT = THREE.RepeatWrapping
    checker.repeat.set(4, 4)
    checker.center.set(0.5, 0.5) // rotate around the texture center, not the UV origin
    checker.anisotropy = renderer.capabilities.getMaxAnisotropy()

    // Clones share the same canvas image but keep their own repeat/offset settings.
    const cubeTexture = checker.clone()
    cubeTexture.repeat.set(1, 1)
    cubeTexture.needsUpdate = true

    const sphereTexture = checker.clone()
    sphereTexture.repeat.set(2, 1)
    sphereTexture.needsUpdate = true

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ map: checker, roughness: 0.6, metalness: 0.1 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ map: cubeTexture, roughness: 0.4, metalness: 0.2 }),
    )
    cube.position.set(-2.6, 1, 0)
    cube.castShadow = true
    scene.add(cube)

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 48, 32),
      new THREE.MeshStandardMaterial({ map: sphereTexture, roughness: 0.3, metalness: 0.35 }),
    )
    sphere.position.set(2.6, 1.15, 0)
    sphere.castShadow = true
    scene.add(sphere)

    scene.add(new THREE.HemisphereLight('#cfe8ff', '#111722', 1))
    const sun = new THREE.DirectionalLight('#ffffff', 2.6)
    sun.position.set(5, 9, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    const state = {
      repeat: 4,
      rotation: 0,
      wrap: 'Repeat',
    }

    const gui = new GUI({ container: ui, title: 'Texture' })
    gui
      .add(state, 'repeat', 1, 12, 1)
      .name('repeat (floor)')
      .onChange((value: number) => {
        checker.repeat.set(value, value)
      })
    gui.add(state, 'rotation', 0, Math.PI * 2, 0.01).onChange((value: number) => {
      checker.rotation = value
    })
    gui
      .add(state, 'wrap', Object.keys(wraps))
      .name('wrap mode')
      .onChange((key: string) => {
        const mode = wraps[key]
        if (mode === undefined) return
        checker.wrapS = mode
        checker.wrapT = mode
        // Wrapping is a GPU sampler setting, so the texture must be re-uploaded.
        checker.needsUpdate = true
      })

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1, 0))

    return {
      scene,
      camera,

      update(delta) {
        cube.rotation.y += delta * 0.4
        sphere.rotation.y += delta * 0.25
        controls.update()
      },

      dispose() {
        gui.destroy()
        controls.dispose()
      },
    }
  },
}
