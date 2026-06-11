import type { Evidence, QuoteCandidate, SiteId } from '../../shared/types'

export interface ConnectorSearchResult {
  candidates: QuoteCandidate[]
  evidences: Evidence[]
}

export interface SiteConnector {
  siteId: SiteId
  displayName: string
  search(input: { query: string; specHint?: string; timeoutMs: number; maxCandidates: number }): Promise<ConnectorSearchResult>
}

