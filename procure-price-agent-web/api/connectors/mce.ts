import * as cheerio from 'cheerio'
import type { Evidence, QuoteCandidate } from '../../shared/types'
import { fetchText } from '../utils/http.js'
import type { ConnectorSearchResult, SiteConnector } from './types.js'

function parsePriceValue(text: string): number | null {
  const cleaned = text.replace(/[,\\s]/g, '')
  const m = cleaned.match(/([0-9]+(?:\\.[0-9]+)?)/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function normalizeSpace(s: string) {
  return s.replace(/\\s+/g, ' ').trim()
}

function pickRowBySpec(rows: Array<{ spec: string; priceText: string; priceValue: number | null; stockText?: string }>, specHint?: string) {
  const numeric = rows.filter((r) => r.priceValue != null) as Array<{
    spec: string
    priceText: string
    priceValue: number
    stockText?: string
  }>
  const hint = (specHint ?? '').trim().toLowerCase()
  if (hint) {
    const exact = numeric.find((r) => r.spec.toLowerCase().includes(hint))
    if (exact) return exact
  }
  if (numeric.length === 0) return null
  return numeric.reduce((a, b) => (a.priceValue <= b.priceValue ? a : b))
}

export class MceConnector implements SiteConnector {
  siteId = 'mce' as const
  displayName = 'MCE（MedChemExpress）'

  async search(input: {
    query: string
    specHint?: string
    timeoutMs: number
    maxCandidates: number
  }): Promise<ConnectorSearchResult> {
    const searchUrl = `https://www.medchemexpress.cn/search.html?q=${encodeURIComponent(input.query)}`
    const { text } = await fetchText(searchUrl, {
      timeoutMs: input.timeoutMs,
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    })

    const $ = cheerio.load(text)
    const links = new Map<string, string>()

    $('a[href]').each((_, el) => {
      const href = String($(el).attr('href') ?? '')
      if (!new RegExp('^/[A-Za-z0-9][^/]*\\\\.html$').test(href)) return
      const label = normalizeSpace($(el).text())
      if (!label) return
      links.set(href, label)
    })

    const picked = Array.from(links.entries()).slice(0, input.maxCandidates)
    const candidates: QuoteCandidate[] = []
    const evidences: Evidence[] = []

    for (const [href, label] of picked) {
      const detailUrl = `https://www.medchemexpress.cn${href}`
      const detail = await this.fetchDetail(detailUrl, input)
      if (!detail) continue

      evidences.push({
        siteId: this.siteId,
        url: detailUrl,
        fetchedAt: new Date().toISOString(),
        basis: 'detail',
        snapshotText: `${detail.title} | ${detail.chosen.spec} | ${detail.chosen.priceText}${
          detail.chosen.stockText ? ` | ${detail.chosen.stockText}` : ''
        }`,
      })

      candidates.push({
        siteId: this.siteId,
        title: detail.title || label,
        url: detailUrl,
        priceText: detail.chosen.priceText,
        priceValue: detail.chosen.priceValue,
        currency: 'CNY',
        matchedCatNo: detail.catNo,
        matchedSpec: detail.chosen.spec,
        confidence: detail.catNo && input.query.trim().toLowerCase() === detail.catNo.toLowerCase() ? 0.92 : 0.72,
        stockText: detail.chosen.stockText,
      })
    }

    return { candidates, evidences }
  }

  private async fetchDetail(
    url: string,
    input: { timeoutMs: number; specHint?: string },
  ): Promise<
    | {
        title: string
        catNo?: string
        chosen: { spec: string; priceText: string; priceValue: number; stockText?: string }
      }
    | null
  > {
    const { text } = await fetchText(url, {
      timeoutMs: input.timeoutMs,
      headers: { 'user-agent': 'Mozilla/5.0' },
    })

    const $ = cheerio.load(text)
    const title = normalizeSpace($('h1').first().text()) || normalizeSpace($('title').text())

    let catNo: string | undefined
    const catMatch = normalizeSpace($.root().text()).match(/目录号[:：]\\s*([A-Za-z0-9-]+)/)
    if (catMatch) catNo = catMatch[1]

    const table = $('table')
      .toArray()
      .map((el) => $(el))
      .find((t) => normalizeSpace(t.text()).includes('规格') && normalizeSpace(t.text()).includes('价格'))

    if (!table) return null

    const rows = table
      .find('tr')
      .toArray()
      .slice(1)
      .map((tr) => {
        const tds = $(tr).find('td').toArray()
        if (tds.length < 2) return null
        const spec = normalizeSpace($(tds[0]).text())
        const priceText = normalizeSpace($(tds[1]).text())
        const stockText = tds.length >= 3 ? normalizeSpace($(tds[2]).text()) : undefined
        const priceValue = parsePriceValue(priceText)
        return { spec, priceText, stockText, priceValue }
      })
      .filter(Boolean) as Array<{ spec: string; priceText: string; stockText?: string; priceValue: number | null }>

    const chosen = pickRowBySpec(rows, input.specHint)
    if (!chosen) return null

    return {
      title,
      catNo,
      chosen,
    }
  }
}
