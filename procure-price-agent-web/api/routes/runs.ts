import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import type { SiteId } from '../../shared/types'
import { startRun } from '../services/runService.js'
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

    const result = await startRun({
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
  const run = await loadRun(runId)
  if (!run) {
    res.status(404).type('text/plain; charset=utf-8').send('任务不存在')
    return
  }
  const md = await loadRunReport(runId)
  if (!md) {
    const message =
      run.status === 'failed'
        ? '报告未生成：任务执行失败'
        : run.status === 'succeeded'
          ? '报告文件暂未就绪，请稍后重试'
          : '任务仍在执行，报告尚未生成'
    res.status(run.status === 'failed' ? 404 : 409).type('text/plain; charset=utf-8').send(message)
    return
  }
  res.setHeader('content-type', 'text/markdown; charset=utf-8')
  res.send(md)
})

router.get('/:runId/export.csv', async (req: Request, res: Response) => {
  const runId = String(req.params.runId)
  const run = await loadRun(runId)
  if (!run) {
    res.status(404).type('text/plain; charset=utf-8').send('任务不存在')
    return
  }
  const csv = await loadRunCsv(runId)
  if (!csv) {
    const message =
      run.status === 'failed'
        ? 'CSV 未生成：任务执行失败'
        : run.status === 'succeeded'
          ? 'CSV 文件暂未就绪，请稍后重试'
          : '任务仍在执行，CSV 尚未生成'
    res.status(run.status === 'failed' ? 404 : 409).type('text/plain; charset=utf-8').send(message)
    return
  }
  res.setHeader('content-type', 'text/csv; charset=utf-8')
  res.send(csv)
})

export default router
