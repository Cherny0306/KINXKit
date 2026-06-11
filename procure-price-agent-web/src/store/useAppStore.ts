import { create } from 'zustand'
import type { AppSettings, RunRecord, SiteId } from '../../shared/types'

export interface SiteMeta {
  siteId: SiteId
  displayName: string
}

interface AppState {
  settings: AppSettings | null
  sites: SiteMeta[]
  lastRun: RunRecord | null
  setSettings: (s: AppSettings) => void
  setSites: (s: SiteMeta[]) => void
  setLastRun: (r: RunRecord | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  sites: [],
  lastRun: null,
  setSettings: (s) => set({ settings: s }),
  setSites: (s) => set({ sites: s }),
  setLastRun: (r) => set({ lastRun: r }),
}))

