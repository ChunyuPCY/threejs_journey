import * as THREE from 'three'
import { describe, expect, it } from 'vite-plus/test'

import { disposeObject, disposeScene } from './dispose'

type Disposable = {
  addEventListener(type: 'dispose', listener: () => void): void
}

/** three signals disposal with an event, so tests can count it instead of mocking. */
function trackDispose(target: Disposable): () => number {
  let disposals = 0
  target.addEventListener('dispose', () => {
    disposals += 1
  })
  return () => disposals
}

describe('disposeObject', () => {
  it('releases the geometry, material and texture of a mesh', () => {
    const texture = new THREE.Texture()
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ map: texture })
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(geometry, material))

    const geometryDisposals = trackDispose(geometry)
    const materialDisposals = trackDispose(material)
    const textureDisposals = trackDispose(texture)

    disposeObject(scene)

    expect(geometryDisposals()).toBe(1)
    expect(materialDisposals()).toBe(1)
    expect(textureDisposals()).toBe(1)
  })

  it('releases every material of a multi-material mesh', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const left = new THREE.MeshBasicMaterial()
    const right = new THREE.MeshBasicMaterial()
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(geometry, [left, right]))

    const leftDisposals = trackDispose(left)
    const rightDisposals = trackDispose(right)

    disposeObject(scene)

    expect(leftDisposals()).toBe(1)
    expect(rightDisposals()).toBe(1)
  })

  it('reaches nested meshes', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial()
    const group = new THREE.Group()
    group.add(new THREE.Mesh(geometry, material))
    const scene = new THREE.Scene()
    scene.add(group)

    const geometryDisposals = trackDispose(geometry)

    disposeObject(scene)

    expect(geometryDisposals()).toBe(1)
  })
})

describe('disposeScene', () => {
  it('releases the environment map and the texture background', () => {
    const environment = new THREE.Texture()
    const background = new THREE.Texture()
    const scene = new THREE.Scene()
    scene.environment = environment
    scene.background = background

    const environmentDisposals = trackDispose(environment)
    const backgroundDisposals = trackDispose(background)

    disposeScene(scene)

    expect(environmentDisposals()).toBe(1)
    expect(backgroundDisposals()).toBe(1)
  })

  it('empties the scene graph', () => {
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))

    disposeScene(scene)

    expect(scene.children).toHaveLength(0)
  })
})
