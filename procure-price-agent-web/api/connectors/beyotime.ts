import type { Evidence, QuoteCandidate } from '../../shared/types'
import { fetchJson } from '../utils/http.js'
import type { ConnectorSearchResult, SiteConnector } from './types.js'

interface BeyotimeSearchResponse {
  code: string
  note?: string
  data: Array<{
    cpcode: string
    cpname: string
    price: number
    unit?: string
    lcode?: string
    state?: string
    srcPrice?: number | null
  }>
}

function confidenceFor(query: string, code: string, name: string) {
  const q = query.trim().toLowerCase()
  const c = (code ?? '').trim().toLowerCase()
  if (!q) return 0.2
  if (q === c) return 0.95
  if (c.includes(q) || q.includes(c)) return 0.85
  if (name.toLowerCase().includes(q)) return 0.65
  return 0.45
}

export class BeyotimeConnector implements SiteConnector {
  siteId = 'beyotime' as const
  displayName = '碧云天（移动站）'

  async search(input: {
    query: string
    specHint?: string
    timeoutMs: number
    maxCandidates: number
  }): Promise<ConnectorSearchResult> {
    const url = 'https://m.beyotime.com/mobilegoods.ajax?method=searchProducts'
    const body = new URLSearchParams({ keyword: input.query }).toString()
    const { json } = await fetchJson<BeyotimeSearchResponse>(url, {
      method: 'POST',
      timeoutMs: input.timeoutMs,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Mozilla/5.0',
      },
      body,
    })

    if (json.code !== '00') {
      throw new Error(json.note ?? 'beyotime search failed')
    }

    const evidences: Evidence[] = []
    const candidates: QuoteCandidate[] = json.data.slice(0, input.maxCandidates).map((r) => {
      const productUrl = `https://m.beyotime.com/mobilegoods.do?method=code&code=${encodeURIComponent(
        r.cpcode,
      )}`
      evidences.push({
        siteId: this.siteId,
        url: productUrl,
        fetchedAt: new Date().toISOString(),
        basis: 'search',
        snapshotText: `${r.cpname} | ${r.cpcode} | ¥${Number(r.price).toFixed(2)}`,
      })
      return {
        siteId: this.siteId,
        title: r.cpname,
        url: productUrl,
        priceText: `¥${Number(r.price).toFixed(2)}`,
        priceValue: Number.isFinite(r.price) ? Number(r.price) : null,
        currency: 'CNY',
        matchedCatNo: r.cpcode,
        confidence: confidenceFor(input.query, r.cpcode, r.cpname),
      }
    })

    return { candidates, evidences }
  }
}

