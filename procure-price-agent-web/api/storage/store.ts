import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { AppSettings, RunListItem, RunRecord } from '../../shared/types'

const dataDir = path.join(process.cwd(), '.data')
const runsDir = path.join(dataDir, 'runs')
const settingsPath = path.join(dataDir, 'settings.json')

async function ensureDirs() {
  await fs.mkdir(runsDir, { recursive: true })
}

export async function loadSettings(): Promise<AppSettings> {
  await ensureDirs()
  try {
    const raw = await fs.readFile(settingsPath, 'utf-8')
    return JSON.parse(raw) as AppSettings
  } catch {
    const defaults: AppSettings = {
      model: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o-mini',
      },
      scrape: {
        timeoutMs: 20000,
        maxCandidatesPerSite: 8,
        cacheTtlMinutes: 30,
      },
      enabledSites: ['beyotime', 'mce', 'jd'],
    }
    await saveSettings(defaults)
    return defaults
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureDirs()
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
}

export function newRunId(): string {
  return randomUUID()
}

function runPath(runId: string) {
  return path.join(runsDir, `${runId}.json`)
}

function reportPath(runId: string) {
  return path.join(runsDir, `${runId}.report.md`)
}

function csvPath(runId: string) {
  return path.join(runsDir, `${runId}.export.csv`)
}

export async function saveRun(run: RunRecord): Promise<void> {
  await ensureDirs()
  await fs.writeFile(runPath(run.id), JSON.stringify(run, null, 2), 'utf-8')
}

export async function saveRunArtifacts(input: {
  runId: string
  reportMd: string
  csv: string
}): Promise<void> {
  await ensureDirs()
  await fs.writeFile(reportPath(input.runId), input.reportMd, 'utf-8')
  await fs.writeFile(csvPath(input.runId), input.csv, 'utf-8')
}

export async function loadRunReport(runId: string): Promise<string | null> {
  await ensureDirs()
  try {
    return await fs.readFile(reportPath(runId), 'utf-8')
  } catch {
    return null
  }
}

export async function loadRunCsv(runId: string): Promise<string | null> {
  await ensureDirs()
  try {
    return await fs.readFile(csvPath(runId), 'utf-8')
  } catch {
    return null
  }
}

export async function loadRun(runId: string): Promise<RunRecord | null> {
  await ensureDirs()
  try {
    const raw = await fs.readFile(runPath(runId), 'utf-8')
    return JSON.parse(raw) as RunRecord
  } catch {
    return null
  }
}

function buildInstructionsPreview(text: string) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (s.length <= 60) return s
  return `${s.slice(0, 60)}…`
}

function toListItem(run: RunRecord): RunListItem {
  const okCount = run.items.filter((i) => i.recommended?.priceValue != null).length
  const overLimitCount = run.items.filter((i) => i.limitCheck?.withinLimit === false).length
  return {
    id: run.id,
    status: run.status,
    createdAt: run.createdAt,
    finishedAt: run.finishedAt,
    instructionsPreview: buildInstructionsPreview(run.instructions),
    siteIds: run.siteIds,
    totalItems: run.totalItems,
    completedItems: run.completedItems,
    okCount,
    overLimitCount,
    errorCount: run.errors.length,
  }
}

export async function listRuns(input?: { limit?: number }): Promise<RunListItem[]> {
  await ensureDirs()
  const limit = Math.max(1, Math.min(200, Number(input?.limit ?? 50)))
  const entries = await fs.readdir(runsDir, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(runsDir, name))

  const loaded = await Promise.all(
    files.map(async (p) => {
      try {
        const raw = await fs.readFile(p, 'utf-8')
        return JSON.parse(raw) as RunRecord
      } catch {
        return null
      }
    }),
  )

  return loaded
    .filter((x): x is RunRecord => Boolean(x))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map(toListItem)
}
