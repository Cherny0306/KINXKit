import type {
  AppSettings,
  ProcurementItemInput,
  RunItemResult,
  RunRecord,
  RunSiteSummary,
  SiteId,
} from '../../shared/types'
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

export interface StartRunOutput {
  run: RunRecord
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

function createInitialSiteSummaries(siteIds: SiteId[]): RunSiteSummary[] {
  return siteIds.map((siteId) => ({
    siteId,
    state: 'idle',
    totalQueries: 0,
    successCount: 0,
    emptyCount: 0,
    timeoutCount: 0,
    errorCount: 0,
    cachedCount: 0,
  }))
}

function getSiteSummary(run: RunRecord, siteId: SiteId): RunSiteSummary {
  const summary = run.siteSummaries.find((s) => s.siteId === siteId)
  if (!summary) {
    const created: RunSiteSummary = {
      siteId,
      state: 'idle',
      totalQueries: 0,
      successCount: 0,
      emptyCount: 0,
      timeoutCount: 0,
      errorCount: 0,
      cachedCount: 0,
    }
    run.siteSummaries.push(created)
    return created
  }
  return summary
}

function classifyConnectorError(error: unknown): {
  type: 'timeout' | 'network' | 'parse' | 'blocked' | 'unknown'
  message: string
} {
  const message = error instanceof Error ? error.message : '未知错误'
  const lower = message.toLowerCase()
  if (lower.includes('abort') || lower.includes('timeout') || lower.includes('超时')) {
    return { type: 'timeout', message: '站点响应超时，已跳过该站点' }
  }
  if (lower.includes('403') || lower.includes('forbidden') || lower.includes('验证') || lower.includes('waf')) {
    return { type: 'blocked', message: '站点触发了访问验证或风控，已降级为跳过' }
  }
  if (lower.includes('json') || lower.includes('parse') || lower.includes('unexpected token')) {
    return { type: 'parse', message: '站点返回内容结构异常，暂时无法解析' }
  }
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('econn') || lower.includes('socket')) {
    return { type: 'network', message: '网络请求失败，建议稍后重试' }
  }
  return { type: 'unknown', message }
}

function finalizeSiteStates(run: RunRecord) {
  for (const summary of run.siteSummaries) {
    if (summary.totalQueries === 0) {
      summary.state = 'idle'
      continue
    }
    if (summary.successCount > 0 && summary.errorCount === 0 && summary.timeoutCount === 0) {
      summary.state = summary.emptyCount > 0 ? 'partial' : 'ok'
      continue
    }
    if (summary.successCount === 0 && (summary.errorCount > 0 || summary.timeoutCount > 0)) {
      summary.state = 'failed'
      continue
    }
    summary.state = 'partial'
  }
}

interface PreparedRunContext {
  settings: AppSettings
  normalizedItems: ProcurementItemInput[]
  run: RunRecord
  parserWarnings: string[]
}

async function prepareRun(input: CreateRunInput): Promise<PreparedRunContext> {
  const settings = await loadSettings()
  const runId = newRunId()

  const { items, warnings } = parseProcurementFile({ filename: input.file.filename, buffer: input.file.buffer })
  const normalized = normalizeInputItems(items)

  const enabledSites = (input.siteIds?.length ? input.siteIds : settings.enabledSites) as SiteId[]

  const run: RunRecord = {
    id: runId,
    status: 'queued',
    createdAt: new Date().toISOString(),
    instructions: input.instructions ?? '',
    siteIds: enabledSites,
    totalItems: normalized.length,
    completedItems: 0,
    siteSummaries: createInitialSiteSummaries(enabledSites),
    items: [],
    errors: [],
  }

  await saveRun(run)
  return { settings, normalizedItems: normalized, run, parserWarnings: warnings }
}

export async function startRun(input: CreateRunInput): Promise<StartRunOutput> {
  const prepared = await prepareRun(input)
  void executeRun(prepared).catch(async (error) => {
    prepared.run.status = 'failed'
    prepared.run.finishedAt = new Date().toISOString()
    prepared.run.errors.push({
      siteId: prepared.run.siteIds[0] ?? 'beyotime',
      type: 'unknown',
      message: error instanceof Error ? error.message : '任务执行失败',
    })
    finalizeSiteStates(prepared.run)
    await saveRun(prepared.run)
  })
  return { run: prepared.run, parserWarnings: prepared.parserWarnings }
}

async function executeRun(prepared: PreparedRunContext): Promise<void> {
  const { settings, normalizedItems, run } = prepared
  const connectors = getConnectors(run.siteIds)
  const cache = new TtlCache<{ candidates: RunItemResult['candidates']; evidences: RunItemResult['evidences'] }>(
    settings.scrape.cacheTtlMinutes * 60 * 1000,
  )

  run.status = 'running'
  await saveRun(run)

  for (const item of normalizedItems) {
    const query = item.catNo || item.rawName
    const perItemCandidates: RunItemResult['candidates'] = []
    const perItemEvidences: RunItemResult['evidences'] = []
    const perItemWarnings: string[] = []

    await Promise.all(
      connectors.map(async (c) => {
        const summary = getSiteSummary(run, c.siteId)
        summary.totalQueries += 1
        const key = `${c.siteId}:${query}:${item.spec ?? ''}`
        const cached = cache.get(key)
        if (cached) {
          summary.cachedCount += 1
          summary.successCount += cached.candidates.length > 0 ? 1 : 0
          summary.emptyCount += cached.candidates.length > 0 ? 0 : 1
          summary.lastMessage =
            cached.candidates.length > 0 ? '命中缓存并返回候选报价' : '命中缓存，但无可用候选报价'
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
          if (res.candidates.length > 0) {
            summary.successCount += 1
            summary.lastMessage = `成功返回 ${res.candidates.length} 条候选报价`
          } else {
            summary.emptyCount += 1
            summary.lastMessage = '请求成功，但未解析到可用公开价格'
          }
          perItemCandidates.push(...res.candidates)
          perItemEvidences.push(...res.evidences)
        } catch (e) {
          const classified = classifyConnectorError(e)
          if (classified.type === 'timeout') summary.timeoutCount += 1
          else summary.errorCount += 1
          summary.lastMessage = classified.message
          run.errors.push({
            siteId: c.siteId,
            itemName: item.rawName,
            query,
            type: classified.type,
            message: classified.message,
          })
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
    run.completedItems += 1
    finalizeSiteStates(run)
    await saveRun(run)
  }

  run.status = 'succeeded'
  finalizeSiteStates(run)
  run.finishedAt = new Date().toISOString()
  await saveRun(run)

  const reportMd = await generateReportMd({ run, settings })
  const csv = buildCsv(run)
  await saveRunArtifacts({ runId: run.id, reportMd, csv })
}
