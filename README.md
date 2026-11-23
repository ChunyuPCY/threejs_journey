# three.js Journey

A small monorepo for learning three.js by reading and breaking working scenes.

Instead of one giant demo, each concept is a self-contained lesson module in
`apps/playground/src/lessons`. The app shell handles rendering, resizing and
navigation; the lessons only contain the three.js code you are learning.

## Quick start

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:5173>.

Other commands:

```bash
pnpm build      # production build of the playground
pnpm preview    # preview the production build
pnpm typecheck  # type-check every workspace package
```

## What is in the box

```
threejs_journey/
├── apps/
│   └── playground/          # Vite + TypeScript + three.js app
│       └── src/
│           ├── main.ts      # shell: renderer, loop, routing, lesson switching
│           ├── types.ts     # the LessonDefinition contract
│           └── lessons/     # one file per lesson, numbered in reading order
├── packages/
│   └── kit/                 # shared three.js helpers (renderer, loop, dispose, ...)
├── pnpm-workspace.yaml      # workspace globs + shared dependency versions (catalog)
└── tsconfig.base.json       # strict TypeScript config shared by every package
```

### Why a monorepo?

- `packages/kit` is reusable. It has no app-specific code, so another app can
  import the same renderer/loop/dispose helpers.
- The workspace catalog pins `three`, `vite` and `typescript` once, so packages
  cannot drift onto different versions.
- Adding a second app (for example a shader playground or an R3F app) is just a
  new folder under `apps/`; pnpm and the root scripts pick it up.

## The lesson path

| # | Lesson | What it teaches |
|---|--------|-----------------|
| 01 | Hello, cube | Scene, camera, renderer, lights, shadows, animation loop |
| 02 | Position, rotation, scale | Object hierarchy, groups, local vs world space |
| 03 | Geometry is just data | BufferGeometry, procedural shapes, flat shading |
| 04 | Materials & reflections | Material families, PBR, metalness/roughness, environment maps |
| 05 | Lights & shadows | Directional/point/spot lights, helpers, shadow maps |
| 06 | Textures & UVs | CanvasTexture, UVs, repeat/wrap/rotation, color space |
| 07 | Picking with a ray | Raycaster, NDC coordinates, pointer events |
| 08 | Post-processing & bloom | EffectComposer, RenderPass, UnrealBloomPass, HDR |
| 09 | Sandbox | A blank scene to experiment in |

Every lesson has a `create()` that returns `{ scene, camera, update }`. The shell
renders the active lesson, resizes its camera, and disposes the previous scene
when you switch. Use the sidebar, the buttons, or the left/right arrow keys.

## Add your own lesson

1. Copy the closest lesson in `apps/playground/src/lessons/`.
2. Change `id`, `title`, `summary` and `concepts`.
3. Export the definition and add it to the array in `lessons/index.ts`.
4. Run `pnpm dev`. The sidebar and routing are generated from that array.

The `LessonDefinition` contract lives in `apps/playground/src/types.ts`:

```ts
export interface LessonInstance {
  scene: THREE.Scene
  camera: THREE.Camera
  update?: (delta: number, elapsed: number) => void
  resize?: (width: number, height: number) => void
  render?: () => void       // replace renderer.render (e.g. EffectComposer)
  dispose?: () => void      // controls, listeners, GUI
}
```

You only own the scene. The shell owns the renderer, the animation loop and
scene disposal (geometries, materials, textures, environment maps).

## Good next steps

- Load a real model with `GLTFLoader` and inspect its node hierarchy.
- Write a custom shader with `ShaderMaterial` and compare it to the built-ins.
- Replace the manual loop with `AnimationMixer` + `AnimationClip`.
- Add `@react-three/fiber` as a second app and feel what it abstracts away.
- Read the three.js source when a helper feels like magic: it is all in
  `node_modules/three/src`.

## Notes

- `three` is pinned through the pnpm catalog; the kit package declares it as a
  peer dependency, so the app controls the actual version.
- The kit is consumed as TypeScript source (`exports: "./src/index.ts"`). Vite
  compiles it directly, which keeps the dev loop fast and avoids a build step
  for an internal package.
