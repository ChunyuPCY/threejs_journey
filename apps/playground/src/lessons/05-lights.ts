import * as THREE from 'three'
import GUI from 'lil-gui'
import { createOrbitControls, createPerspectiveCamera } from '@threejs-journey/kit'
import type { LessonDefinition } from '../types'

export const lights: LessonDefinition = {
  id: 'lights',
  title: 'Lights & shadows',
  summary:
    'A shadow is not free: a light has to render the scene from its own point of view into a shadow map. Directional lights use an orthographic shadow camera, spot and point lights use a perspective one. Turn the helpers on to see where each light lives.',
  concepts: ['DirectionalLight', 'PointLight', 'SpotLight', 'shadow maps'],

  create({ renderer, ui }) {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#070a10')
    scene.fog = new THREE.Fog('#070a10', 16, 32)

    const camera = createPerspectiveCamera([7.5, 6, 10])
    camera.lookAt(0, 1.2, 0)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: '#10151f', roughness: 0.88, metalness: 0.08 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    scene.add(new THREE.GridHelper(50, 50, '#263449', '#141b26'))

    const sphereGeometry = new THREE.SphereGeometry(0.8, 48, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: '#dbeafe',
      roughness: 0.3,
      metalness: 0.2,
    })

    for (const x of [-3.2, 0, 3.2]) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(x, 1, 0)
      sphere.castShadow = true
      sphere.receiveShadow = true
      scene.add(sphere)
    }

    // 1. Soft ambient fill from above/below.
    const hemisphere = new THREE.HemisphereLight('#93c5fd', '#0f172a', 0.55)
    scene.add(hemisphere)

    // 2. Sun-like light. Its shadow camera is orthographic and covers this box.
    const directional = new THREE.DirectionalLight('#ffffff', 2.4)
    directional.position.set(5, 9, 6)
    directional.castShadow = true
    directional.shadow.mapSize.set(1024, 1024)
    directional.shadow.camera.left = -8
    directional.shadow.camera.right = 8
    directional.shadow.camera.top = 8
    directional.shadow.camera.bottom = -8
    directional.shadow.camera.near = 0.5
    directional.shadow.camera.far = 30
    scene.add(directional)

    // 3. A colored bulb that moves. Intensity is in candela (decay = 2 by default).
    const point = new THREE.PointLight('#f472b6', 22, 14, 2)
    point.position.set(3, 2.6, 2.5)
    point.castShadow = true
    point.shadow.mapSize.set(512, 512)
    point.shadow.bias = -0.002
    scene.add(point)

    // 4. A cone of light aimed at the origin.
    const spot = new THREE.SpotLight('#38bdf8', 70, 22, Math.PI / 6, 0.45, 1.6)
    spot.position.set(-4.5, 7.5, -3)
    spot.target.position.set(0, 0, 0)
    spot.castShadow = true
    spot.shadow.mapSize.set(1024, 1024)
    spot.shadow.bias = -0.0005
    scene.add(spot)
    scene.add(spot.target)

    const directionalHelper = new THREE.DirectionalLightHelper(directional, 2, '#ffffff')
    const pointHelper = new THREE.PointLightHelper(point, 0.35, '#f472b6')
    const spotHelper = new THREE.SpotLightHelper(spot, '#38bdf8')
    scene.add(directionalHelper, pointHelper, spotHelper)

    const state = {
      hemisphere: 0.55,
      directional: 2.4,
      point: 22,
      spot: 70,
      helpers: true,
    }

    const gui = new GUI({ container: ui, title: 'Lights' })
    gui.add(state, 'hemisphere', 0, 2, 0.01).onChange((value: number) => {
      hemisphere.intensity = value
    })
    gui.add(state, 'directional', 0, 5, 0.01).onChange((value: number) => {
      directional.intensity = value
    })
    gui.add(state, 'point', 0, 50, 0.1).onChange((value: number) => {
      point.intensity = value
    })
    gui.add(state, 'spot', 0, 150, 0.1).onChange((value: number) => {
      spot.intensity = value
    })
    gui.add(state, 'helpers').onChange((visible: boolean) => {
      directionalHelper.visible = visible
      pointHelper.visible = visible
      spotHelper.visible = visible
    })

    const controls = createOrbitControls(camera, renderer.domElement, new THREE.Vector3(0, 1.2, 0))

    return {
      scene,
      camera,

      update(_delta, elapsed) {
        const angle = elapsed * 0.75
        point.position.set(Math.cos(angle) * 3.6, 2.6, Math.sin(angle) * 3.6)
        pointHelper.update()
        controls.update()
      },

      dispose() {
        gui.destroy()
        controls.dispose()
      },
    }
  },
}
