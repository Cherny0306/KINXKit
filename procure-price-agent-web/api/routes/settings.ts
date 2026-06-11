import { Router, type Request, type Response } from 'express'
import type { AppSettings } from '../../shared/types'
import { listConnectors } from '../connectors/index.js'
import { loadSettings, saveSettings } from '../storage/store.js'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await loadSettings()
    res.json({ success: true, data: settings })
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : '读取失败' })
  }
})

router.put('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<AppSettings>
    const existing = await loadSettings()
    const next: AppSettings = {
      model: {
        baseUrl: String(body.model?.baseUrl ?? existing.model.baseUrl ?? ''),
        apiKey: String(body.model?.apiKey ?? existing.model.apiKey ?? ''),
        model: String(body.model?.model ?? existing.model.model ?? ''),
      },
      scrape: {
        timeoutMs: Number(body.scrape?.timeoutMs ?? existing.scrape.timeoutMs ?? 20000),
        maxCandidatesPerSite: Number(
          body.scrape?.maxCandidatesPerSite ?? existing.scrape.maxCandidatesPerSite ?? 8,
        ),
        cacheTtlMinutes: Number(body.scrape?.cacheTtlMinutes ?? existing.scrape.cacheTtlMinutes ?? 30),
      },
      enabledSites: (body.enabledSites ?? existing.enabledSites) as AppSettings['enabledSites'],
    }

    await saveSettings(next)
    res.json({ success: true, data: next })
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : '保存失败' })
  }
})

router.get('/sites', async (_req: Request, res: Response) => {
  res.json({ success: true, data: listConnectors() })
})

export default router
