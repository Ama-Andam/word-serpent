/**
 * All achievements, in trophy-case order. Add a badge by importing it here.
 */
import comboX4 from './comboX4'
import firstWords from './firstWords'
import flawless from './flawless'
import goalGetter from './goalGetter'
import nightOwl from './nightOwl'
import serpentLength20 from './serpentLength20'
import serpentOuroboros from './serpentOuroboros'
import serpentThreeStars from './serpentThreeStars'
import streak3 from './streak3'
import streak7 from './streak7'
import tenThousandWords from './tenThousandWords'
import thousandWords from './thousandWords'
import type { Achievement } from './types'
import wpm60 from './wpm60'

export const ACHIEVEMENTS: Achievement[] = [
  firstWords,
  goalGetter,
  thousandWords,
  tenThousandWords,
  streak3,
  streak7,
  wpm60,
  flawless,
  comboX4,
  serpentLength20,
  serpentThreeStars,
  serpentOuroboros,
  nightOwl,
]

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)
