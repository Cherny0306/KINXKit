import * as cheerio from 'cheerio'
import type { Evidence, QuoteCandidate } from '../../shared/types'
import { fetchText } from '../utils/http.js'
import type { ConnectorSearchResult, SiteConnector } from './types.js'

function normalizeSpace(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

function parseNumber(text: string): number | null {
  const m = text.replace(/[,\\s]/g, '').match(/([0-9]+(?:\\.[0-9]+)?)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

export class JdConnector implements SiteConnector {
  siteId = 'jd' as const
  displayName = '京东（公开搜索，尽力而为）'

  async search(input: {
    query: string
    specHint?: string
    timeoutMs: number
    maxCandidates: number
  }): Promise<ConnectorSearchResult> {
    const searchUrl = `https://search.jd.com/Search?keyword=${encodeURIComponent(input.query)}`
    const { status, text, finalUrl } = await fetchText(searchUrl, {
      timeoutMs: input.timeoutMs,
      headers: { 'user-agent': 'Mozilla/5.0' },
    })

    if (status >= 400) return { candidates: [], evidences: [] }

    const $ = cheerio.load(text)
    const items = $('#J_goodsList li.gl-item').toArray().slice(0, input.maxCandidates)
    const candidates: QuoteCandidate[] = []
    const evidences: Evidence[] = []

    for (const el of items) {
      const root = $(el)
      const a = root.find('a[href]').first()
      const href = String(a.attr('href') ?? '')
      const url = href.startsWith('http') ? href : `https:${href}`
      const title = normalizeSpace(root.find('div.p-name em').text()) || normalizeSpace(a.text())
      const priceText = normalizeSpace(root.find('div.p-price i').text())
      const priceValue = parseNumber(priceText)
      if (!url || !title) continue

      evidences.push({
        siteId: this.siteId,
        url,
        fetchedAt: new Date().toISOString(),
        basis: 'search',
        snapshotText: `${title} | ${priceText || '未知价格'}`,
      })

      candidates.push({
        siteId: this.siteId,
        title,
        url,
        priceText: priceText || '未知',
        priceValue,
        currency: 'CNY',
        confidence: 0.4,
      })
    }

    if (candidates.length === 0) {
      evidences.push({
        siteId: this.siteId,
        url: finalUrl,
        fetchedAt: new Date().toISOString(),
        basis: 'search',
        snapshotText: '未解析到可用的公开价格（可能被风控/页面结构变化）',
      })
    }

    return { candidates, evidences }
  }
}

