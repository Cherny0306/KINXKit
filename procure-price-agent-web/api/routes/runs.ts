import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import type { SiteId } from '../../shared/types'
import { createRun } from '../services/runService.js'
import { loadRun, loadRunCsv, loadRunReport } from '../storage/store.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ success: false, error: '缺少采购清单文件' })
      return
    }

    const instructions = String(req.body.instructions ?? '')
    const rawSiteIds = String(req.body.siteIds ?? '')
    const siteIds = rawSiteIds
      ? rawSiteIds
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    const result = await createRun({
      file: { filename: file.originalname, buffer: file.buffer },
      instructions,
      siteIds: siteIds as SiteId[] | undefined,
    })

    res.json({
      success: true,
      data: {
        runId: result.run.id,
        run: result.run,
        parserWarnings: result.parserWarnings,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : '任务执行失败'
    res.status(500).json({ success: false, error: message })
  }
})

router.get('/:runId', async (req: Request, res: Response) => {
  const runId = String(req.params.runId)
  const run = await loadRun(runId)
  if (!run) {
    res.status(404).json({ success: false, error: '任务不存在' })
    return
  }
  res.json({ success: true, data: run })
})

router.get('/:runId/report.md', async (req: Request, res: Response) => {
  const runId = String(req.params.runId)
  const md = await loadRunReport(runId)
  if (!md) {
    res.status(404).send('not found')
    return
  }
  res.setHeader('content-type', 'text/markdown; charset=utf-8')
  res.send(md)
})

router.get('/:runId/export.csv', async (req: Request, res: Response) => {
  const runId = String(req.params.runId)
  const csv = await loadRunCsv(runId)
  if (!csv) {
    res.status(404).send('not found')
    return
  }
  res.setHeader('content-type', 'text/csv; charset=utf-8')
  res.send(csv)
})

export default router
