/**
 * Applies a finished session to the profile: bonuses, streak, totals,
 * serpent progress, daily challenge, and achievements. Pure, so it's easy to test.
 */
import { ACHIEVEMENTS } from './achievements/registry'
import type { Achievement } from './achievements/types'
import { dailyChallenge } from './challenges/registry'
import type { Challenge } from './challenges/types'
import { advanceStreak } from './streak'
import type { Profile, SessionSummary } from './types'
import { levelFromXp, XP } from './xp'

export interface Bonus {
  label: string
  xp: number
}

export interface SessionResult {
  summary: SessionSummary
  bonuses: Bonus[]
  /** Live XP + bonuses */
  xpTotal: number
  unlocked: Achievement[]
  daily?: Challenge
  levelBefore: number
  levelAfter: number
}

export function applySession(prev: Profile, summary: SessionSummary, today: string): { profile: Profile; result: SessionResult } {
  const levelBefore = levelFromXp(prev.xp - summary.liveXp)
  const bonuses: Bonus[] = []
  const sv = summary.serpent

  if (summary.goalHit) bonuses.push({ label: 'Word goal', xp: XP.goalHit })
  if (summary.words >= XP.sessionMinWords && !sv) bonuses.push({ label: 'Session complete', xp: XP.sessionBonus })
  if (sv?.cleared) bonuses.push({ label: 'Garden cleared', xp: XP.gardenClear })
  if (sv && sv.stars > 0) bonuses.push({ label: `${sv.stars} star${sv.stars > 1 ? 's' : ''}`, xp: sv.stars * XP.perStar })

  const challenge = dailyChallenge(today)
  const daily = prev.dailyDone !== today && challenge.validate(summary) ? challenge : undefined
  if (daily) bonuses.push({ label: `Daily: ${daily.title}`, xp: daily.xp })

  const bonusXp = bonuses.reduce((a, b) => a + b.xp, 0)
  const streak = advanceStreak(prev.lastActiveDay, prev.streak, today)

  const profile: Profile = {
    ...prev,
    xp: prev.xp + bonusXp,
    totalWords: prev.totalWords + summary.words,
    totalSessions: prev.totalSessions + 1,
    bestWpm: Math.max(prev.bestWpm, summary.words >= 20 ? summary.wpm : 0),
    bestCombo: Math.max(prev.bestCombo, summary.peakCombo),
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    lastActiveDay: today,
    dailyDone: daily ? today : prev.dailyDone,
    serpent: sv
      ? {
          ...prev.serpent,
          totalInk: prev.serpent.totalInk + sv.inkEaten,
          recentWpm: [...prev.serpent.recentWpm, summary.wpm].filter((w) => w > 0).slice(-5),
          stars: sv.gardenId
            ? { ...prev.serpent.stars, [sv.gardenId]: Math.max(prev.serpent.stars[sv.gardenId] ?? 0, sv.stars) }
            : prev.serpent.stars,
          best: sv.gardenId
            ? prev.serpent.best
            : { ...prev.serpent.best, [sv.tier]: Math.max(prev.serpent.best[sv.tier] ?? 0, sv.score) },
        }
      : prev.serpent,
  }

  const unlocked = ACHIEVEMENTS.filter((a) => !profile.unlocked[a.id] && a.check({ profile, summary }))
  const now = Date.now()
  for (const a of unlocked) profile.unlocked = { ...profile.unlocked, [a.id]: now }

  return {
    profile,
    result: {
      summary,
      bonuses,
      xpTotal: summary.liveXp + bonusXp,
      unlocked,
      daily,
      levelBefore,
      levelAfter: levelFromXp(profile.xp),
    },
  }
}
