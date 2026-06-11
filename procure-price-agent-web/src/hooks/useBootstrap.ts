import { useEffect } from 'react'
import { apiGet } from '@/utils/api'
import { useAppStore } from '@/store/useAppStore'
import type { AppSettings, SiteId } from '../../shared/types'

export function useBootstrap() {
  const setSettings = useAppStore((s) => s.setSettings)
  const setSites = useAppStore((s) => s.setSites)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const settings = await apiGet<AppSettings>('/api/settings')
        if (!cancelled) setSettings(settings)
        const sites = await apiGet<Array<{ siteId: SiteId; displayName: string }>>('/api/settings/sites')
        if (!cancelled) setSites(sites)
      } catch {
        if (!cancelled) {
          setSites([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setSettings, setSites])
}

