import type { LessonDefinition } from '../types'
import { helloCube } from './01-hello-cube'
import { transforms } from './02-transforms'
import { geometries } from './03-geometries'
import { materials } from './04-materials'
import { lights } from './05-lights'
import { textures } from './06-textures'
import { interaction } from './07-interaction'
import { postprocessing } from './08-postprocessing'
import { sandbox } from './09-sandbox'

export const lessons: LessonDefinition[] = [
  helloCube,
  transforms,
  geometries,
  materials,
  lights,
  textures,
  interaction,
  postprocessing,
  sandbox,
]
