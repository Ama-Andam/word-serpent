/**
 * App state (Zustand). Everything except transient UI is saved to localStorage
 * under one versioned key, so stats and progress survive refreshes.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { emit } from '@/game/events'
import { applySession, type SessionResult } from '@/game/progression'
import type { TierId } from '@/game/serpent/tiers'
import { newProfile, type Profile, type SessionSummary, type WriteMode } from '@/game/types'
import { levelFromXp, levelTitle } from '@/game/xp'
import { dayKey } from '@/lib/date'
import { setSoundEnabled } from '@/lib/sound'
import { countWords } from '@/lib/textStats'

export interface Draft {
  id: string
  text: string
  mode: WriteMode
  createdAt: number
  updatedAt: number
  words: number
}

export type View = 'write' | 'serpent'
export type Dialog = 'help' | 'trophies' | 'sessions' | null

interface Settings {
  /** null = follow the system */
  theme: 'light' | 'dark' | null
  sound: boolean
  goal: number
  sprintSeconds: number
  writeMode: WriteMode
}

interface State {
  settings: Settings
  view: View
  profile: Profile
  drafts: Draft[]
  currentId: string
  // transient
  dialog: Dialog
  result: SessionResult | null
  /** Set when the player starts today's challenge from its card. */
  challengeActive: boolean
  /** Bumped to tell the writing view to start a fresh session (shortcuts, sprint start…). */
  resetTick: number
  /** True while typing in Focus mode: chrome and stats fade away. */
  focusing: boolean

  setView: (v: View) => void
  setDialog: (d: Dialog) => void
  setTheme: (t: 'light' | 'dark') => void
  toggleSound: () => void
  setGoal: (n: number) => void
  setSprintSeconds: (n: number) => void
  setWriteMode: (m: WriteMode) => void
  setChallengeActive: (on: boolean) => void
  setFocusing: (on: boolean) => void

  newDraft: () => void
  openDraft: (id: string) => void
  deleteDraft: (id: string) => void
  restoreDraft: (d: Draft) => void
  updateText: (text: string) => void

  gainXp: (amount: number) => void
  finishSession: (summary: SessionSummary) => SessionResult
  clearResult: () => void

  setTier: (t: TierId) => void
  completePlacement: (t: TierId) => void
  resetProgress: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const blankDraft = (mode: WriteMode): Draft => {
  const now = Date.now()
  return { id: uid(), text: '', mode, createdAt: now, updatedAt: now, words: 0 }
}

const first = blankDraft('free')

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      settings: { theme: null, sound: false, goal: 300, sprintSeconds: 300, writeMode: 'free' },
      view: 'write',
      profile: newProfile(),
      drafts: [first],
      currentId: first.id,
      dialog: null,
      result: null,
      challengeActive: false,
      resetTick: 0,
      focusing: false,

      setView: (view) => set({ view }),
      setDialog: (dialog) => set({ dialog }),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      toggleSound: () =>
        set((s) => {
          setSoundEnabled(!s.settings.sound)
          return { settings: { ...s.settings, sound: !s.settings.sound } }
        }),
      setGoal: (goal) => set((s) => ({ settings: { ...s.settings, goal } })),
      setSprintSeconds: (sprintSeconds) => set((s) => ({ settings: { ...s.settings, sprintSeconds } })),
      setWriteMode: (writeMode) => set((s) => ({ settings: { ...s.settings, writeMode } })),
      setChallengeActive: (challengeActive) => set({ challengeActive }),
      setFocusing: (focusing) => set((s) => (s.focusing === focusing ? s : { focusing })),

      newDraft: () =>
        set((s) => {
          const cur = s.drafts.find((d) => d.id === s.currentId)
          // Reuse an empty current draft instead of piling up blanks.
          if (cur && !cur.text.trim()) return { resetTick: s.resetTick + 1 }
          const d = blankDraft(s.settings.writeMode)
          return { drafts: [d, ...s.drafts].slice(0, 100), currentId: d.id, resetTick: s.resetTick + 1 }
        }),
      openDraft: (id) => set((s) => ({ currentId: id, view: 'write', dialog: null, resetTick: s.resetTick + 1 })),
      deleteDraft: (id) =>
        set((s) => {
          const drafts = s.drafts.filter((d) => d.id !== id)
          if (drafts.length === 0) drafts.push(blankDraft(s.settings.writeMode))
          const currentId = s.currentId === id ? drafts[0].id : s.currentId
          return { drafts, currentId, resetTick: s.currentId === id ? s.resetTick + 1 : s.resetTick }
        }),
      restoreDraft: (d) => set((s) => ({ drafts: [d, ...s.drafts.filter((x) => x.id !== d.id)] })),
      updateText: (text) =>
        set((s) => ({
          drafts: s.drafts.map((d) =>
            d.id === s.currentId ? { ...d, text, updatedAt: Date.now(), words: countWords(text), mode: s.settings.writeMode } : d,
          ),
        })),

      gainXp: (amount) => {
        const before = levelFromXp(get().profile.xp)
        set((s) => ({ profile: { ...s.profile, xp: s.profile.xp + amount } }))
        const after = levelFromXp(get().profile.xp)
        if (after > before) emit('levelUp', { level: after, title: levelTitle(after) })
      },

      finishSession: (summary) => {
        const prev = get().profile
        const { profile, result } = applySession(prev, summary, dayKey())
        set({ profile, result, challengeActive: false })
        // Live XP already announced its own level-ups; only bonuses can add one here.
        if (result.levelAfter > levelFromXp(prev.xp)) {
          emit('levelUp', { level: result.levelAfter, title: levelTitle(result.levelAfter) })
        }
        if (result.daily) emit('dailyComplete', { challenge: result.daily })
        result.unlocked.forEach((achievement) => emit('unlock', { achievement }))
        return result
      },
      clearResult: () => set({ result: null }),

      setTier: (tier) => set((s) => ({ profile: { ...s.profile, serpent: { ...s.profile.serpent, tier } } })),
      completePlacement: (tier) =>
        set((s) => ({ profile: { ...s.profile, serpent: { ...s.profile.serpent, tier, placementDone: true } } })),
      resetProgress: () => set({ profile: newProfile() }),
    }),
    {
      name: 'inkwell:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        settings: s.settings,
        view: s.view,
        profile: s.profile,
        drafts: s.drafts,
        currentId: s.currentId,
      }),
      onRehydrateStorage: () => (s) => {
        if (s) setSoundEnabled(s.settings.sound)
      },
    },
  ),
)
