export type SiteId = 'beyotime' | 'mce' | 'jd'

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type Currency = 'CNY' | 'USD' | 'UNKNOWN'

export interface ModelConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export interface ScrapeConfig {
  timeoutMs: number
  maxCandidatesPerSite: number
  cacheTtlMinutes: number
}

export interface AppSettings {
  model: ModelConfig
  scrape: ScrapeConfig
  enabledSites: SiteId[]
}

export interface ProcurementItemInput {
  rawName: string
  brand?: string
  catNo?: string
  spec?: string
  quantity?: number
  limitPrice?: number
}

export interface QuoteCandidate {
  siteId: SiteId
  title: string
  url: string
  priceText: string
  priceValue: number | null
  currency: Currency
  matchedCatNo?: string
  matchedSpec?: string
  confidence: number
  stockText?: string
}

export interface Evidence {
  siteId: SiteId
  url: string
  fetchedAt: string
  basis: 'search' | 'detail'
  snapshotText: string
}

export interface RunItemResult {
  item: ProcurementItemInput
  recommended?: QuoteCandidate
  candidates: QuoteCandidate[]
  evidences: Evidence[]
  warnings: string[]
  limitCheck?: {
    limitPrice?: number
    recommendedPrice?: number | null
    withinLimit?: boolean
  }
}

export type RunSiteState = 'idle' | 'ok' | 'partial' | 'failed'

export interface RunSiteSummary {
  siteId: SiteId
  state: RunSiteState
  totalQueries: number
  successCount: number
  emptyCount: number
  timeoutCount: number
  errorCount: number
  cachedCount: number
  lastMessage?: string
}

export interface RunRecord {
  id: string
  status: RunStatus
  createdAt: string
  finishedAt?: string
  instructions: string
  siteIds: SiteId[]
  totalItems: number
  completedItems: number
  siteSummaries: RunSiteSummary[]
  items: RunItemResult[]
  errors: {
    siteId: SiteId
    itemName?: string
    query?: string
    type?: 'timeout' | 'network' | 'parse' | 'blocked' | 'unknown'
    message: string
  }[]
}
