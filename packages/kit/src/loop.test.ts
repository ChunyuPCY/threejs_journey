import type * as THREE from 'three'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { createLoop } from './loop'

type Frame = ((time: number) => void) | null

function createFakeRenderer() {
  let frame: Frame = null

  const renderer = {
    setAnimationLoop(callback: Frame): void {
      frame = callback
    },
  } as unknown as THREE.WebGLRenderer

  return {
    renderer,
    currentFrame: () => frame,
    runFrame: () => frame?.(0),
  }
}

/** Feed THREE.Clock a fixed millisecond timeline so the delta math is deterministic. */
function mockTimeline(times: number[]): void {
  let index = 0
  vi.spyOn(performance, 'now').mockImplementation(
    () => times[index++] ?? times[times.length - 1] ?? 0,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createLoop', () => {
  it('installs a frame callback and clears it on stop', () => {
    const { renderer, currentFrame, runFrame } = createFakeRenderer()
    const calls: number[] = []

    const loop = createLoop(renderer, () => {
      calls.push(1)
    })

    expect(typeof currentFrame()).toBe('function')
    runFrame()
    runFrame()
    expect(calls).toHaveLength(2)

    loop.stop()
    expect(currentFrame()).toBeNull()
  })

  it('clamps a long frame and accumulates the clamped time', () => {
    // Frame 1 starts the clock, frame 2 arrives 16 seconds later (backgrounded tab).
    mockTimeline([1_000, 1_016_000])

    const { renderer, runFrame } = createFakeRenderer()
    const samples: Array<[delta: number, elapsed: number]> = []

    createLoop(renderer, (delta, elapsed) => {
      samples.push([delta, elapsed])
    })

    runFrame()
    runFrame()

    expect(samples).toEqual([
      [0, 0],
      [0.1, 0.1],
    ])
  })
})
