import * as THREE from 'three'

/**
 * Draws into an offscreen 2D canvas and wraps it in a texture. Handy for
 * learning: you can see exactly where the pixels come from, with no assets.
 */
export function createCanvasTexture(
  size: number,
  draw: (context: CanvasRenderingContext2D, size: number) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')

  draw(context, size)

  const texture = new THREE.CanvasTexture(canvas)
  // Color maps are authored in sRGB. Data maps (normal, roughness) must not be.
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
