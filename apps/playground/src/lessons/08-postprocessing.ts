import * as THREE from 'three'
import GUI from 'lil-gui'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import {
  addRoomEnvironment,
  createOrbitControls,
  createPerspectiveCamera,
} from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

export const postprocessing: LessonDefinition = {
  id: 'postprocessing',
  title: 'Post-processing & bloom',
  summary:
    'Instead of drawing straight to the screen, render the scene into a texture, run image effects on it, then draw the result. Here a bloom pass finds bright pixels and smears them outward. The emissive spheres are deliberately brighter than 1.0 so they glow.',
  concepts: ['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'HDR colors'],

  create({ renderer, ui, width, height }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#05070b')
    scene.fog = new THREE.Fog('#05070b', 12, 26)

    const camera = createPerspectiveCamera([0, 2.8, 6.8])
    camera.lookAt(0, 1.2, 0)

    addRoomEnvironment(renderer, scene, 0.7)

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.05, 0.3, 220, 36),
      new THREE.MeshStandardMaterial({
        color: '#0ea5e9',
        metalness: 0.95,
        roughness: 0.14,
        emissive: '#0c4a6e',
        emissiveIntensity: 0.5,
      }),
    )
    knot.position.y = 1.2
    scene.add(knot)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: '#0a0f17', roughness: 0.7, metalness: 0.3 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    scene.add(new THREE.HemisphereLight('#93c5fd', '#0f172a', 0.4))
    const sun = new THREE.DirectionalLight('#ffffff', 1.6)
    sun.position.set(5, 9, 6)
    scene.add(sun)

    const orbs = [
      { color: '#38bdf8', radius: 2.6, speed: 0.5, offset: 0 },
      { color: '#f472b6', radius: 3.1, speed: -0.34, offset: 2.1 },
      { color: '#facc15', radius: 2.2, speed: 0.72, offset: 4.2 },
    ].map((config) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 24, 16),
        // Emissive values above 1 become HDR pixels; bloom loves those.
        new THREE.MeshStandardMaterial({
          color: '#000000',
          emissive: config.color,
          emissiveIntensity: 5,
        }),
      )
      scene.add(orb)
      return { ...config, mesh: orb }
    })

    // The composer owns its own render targets, sized like the canvas.
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.15, 0.5, 0.25)
    composer.addPass(bloom)

    // OutputPass applies tone mapping and sRGB conversion at the very end.
    composer.addPass(new OutputPass())

    const gui = new GUI({ container: ui, title: 'Bloom' })
    gui.add(bloom, 'strength', 0, 3, 0.01)
    gui.add(bloom, 'radius', 0, 1.5, 0.01)
    gui.add(bloom, 'threshold', 0, 1, 0.01)

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1.2, 0))

    return {
      scene,
      camera,

      update(delta, elapsed) {
        knot.rotation.y += delta * 0.4
        knot.rotation.x += delta * 0.15

        orbs.forEach((orb) => {
          const angle = elapsed * orb.speed + orb.offset
          orb.mesh.position.set(
            Math.cos(angle) * orb.radius,
            1.2 + Math.sin(angle * 2) * 0.7,
            Math.sin(angle) * orb.radius,
          )
        })

        controls.update()
      },

      render() {
        composer.render()
      },

      resize(nextWidth, nextHeight) {
        composer.setSize(nextWidth, nextHeight)
      },

      dispose() {
        gui.destroy()
        composer.dispose()
        controls.dispose()
      },
    }
  },
}
