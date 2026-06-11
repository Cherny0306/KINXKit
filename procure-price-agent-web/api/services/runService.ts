import type { AppSettings, ProcurementItemInput, RunItemResult, RunRecord, SiteId } from '../../shared/types'
import { getConnectors } from '../connectors/index.js'
import { parseProcurementFile } from '../parsers/procurement.js'
import { TtlCache } from '../storage/cache.js'
import { loadSettings, newRunId, saveRun, saveRunArtifacts } from '../storage/store.js'
import { buildRunItemResult } from './matcher.js'
import { generateReportMd } from './report.js'

export interface CreateRunInput {
  file: { filename: string; buffer: Buffer }
  instructions: string
  siteIds?: SiteId[]
}

export interface CreateRunOutput {
  run: RunRecord
  reportMd: string
  csv: string
  parserWarnings: string[]
}

function buildCsv(run: RunRecord) {
  const header = [
    'brand',
    'catNo',
    'spec',
    'rawName',
    'quantity',
    'limitPrice',
    'recommendedSite',
    'recommendedPrice',
    'url',
  ]
  const rows = run.items.map((r) => [
    r.item.brand ?? '',
    r.item.catNo ?? '',
    r.item.spec ?? '',
    r.item.rawName ?? '',
    r.item.quantity ?? '',
    r.item.limitPrice ?? '',
    r.recommended?.siteId ?? '',
    r.recommended?.priceValue ?? '',
    r.recommended?.url ?? '',
  ])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [header.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
}

function normalizeInputItems(items: ProcurementItemInput[]): ProcurementItemInput[] {
  return items.map((i) => ({
    ...i,
    rawName: String(i.rawName ?? '').trim(),
    brand: i.brand ? String(i.brand).trim() : undefined,
    catNo: i.catNo ? String(i.catNo).trim() : undefined,
    spec: i.spec ? String(i.spec).trim() : undefined,
  }))
}

export async function createRun(input: CreateRunInput): Promise<CreateRunOutput> {
  const settings = await loadSettings()
  const runId = newRunId()

  const { items, warnings } = parseProcurementFile({ filename: input.file.filename, buffer: input.file.buffer })
  const normalized = normalizeInputItems(items)

  const enabledSites = (input.siteIds?.length ? input.siteIds : settings.enabledSites) as SiteId[]
  const connectors = getConnectors(enabledSites)
  const cache = new TtlCache<{ candidates: RunItemResult['candidates']; evidences: RunItemResult['evidences'] }>(
    settings.scrape.cacheTtlMinutes * 60 * 1000,
  )

  const run: RunRecord = {
    id: runId,
    status: 'running',
    createdAt: new Date().toISOString(),
    instructions: input.instructions ?? '',
    siteIds: enabledSites,
    items: [],
    errors: [],
  }

  await saveRun(run)

  for (const item of normalized) {
    const query = item.catNo || item.rawName
    const perItemCandidates: RunItemResult['candidates'] = []
    const perItemEvidences: RunItemResult['evidences'] = []
    const perItemWarnings: string[] = []

    await Promise.all(
      connectors.map(async (c) => {
        const key = `${c.siteId}:${query}:${item.spec ?? ''}`
        const cached = cache.get(key)
        if (cached) {
          perItemCandidates.push(...cached.candidates)
          perItemEvidences.push(...cached.evidences)
          return
        }
        try {
          const res = await c.search({
            query,
            specHint: item.spec,
            timeoutMs: settings.scrape.timeoutMs,
            maxCandidates: settings.scrape.maxCandidatesPerSite,
          })
          cache.set(key, { candidates: res.candidates, evidences: res.evidences })
          perItemCandidates.push(...res.candidates)
          perItemEvidences.push(...res.evidences)
        } catch (e) {
          const message = e instanceof Error ? e.message : '未知错误'
          run.errors.push({ siteId: c.siteId, message })
        }
      }),
    )

    if (perItemCandidates.length === 0) perItemWarnings.push('未获取到可用候选报价')
    const result = buildRunItemResult({
      item,
      candidates: perItemCandidates,
      evidences: perItemEvidences,
      warnings: perItemWarnings,
    })
    run.items.push(result)
    await saveRun(run)
  }

  run.status = run.errors.length > 0 ? 'succeeded' : 'succeeded'
  run.finishedAt = new Date().toISOString()
  await saveRun(run)

  const reportMd = await generateReportMd({ run, settings })
  const csv = buildCsv(run)
  await saveRunArtifacts({ runId: run.id, reportMd, csv })

  return { run, reportMd, csv, parserWarnings: warnings }
}
