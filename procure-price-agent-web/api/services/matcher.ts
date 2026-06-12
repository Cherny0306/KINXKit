import type { ProcurementItemInput, QuoteCandidate, RunItemResult } from '../../shared/types'

function normalize(s: string | undefined) {
  return (s ?? '').trim().toLowerCase()
}

function matchesName(item: ProcurementItemInput, c: QuoteCandidate) {
  const name = normalize(item.rawName)
  if (!name) return false
  const title = normalize(c.title)
  if (!title) return false
  return title.includes(name) || name.includes(title)
}

function pickRecommended(item: ProcurementItemInput, candidates: QuoteCandidate[]) {
  const withPrice = candidates.filter((c) => c.priceValue != null) as Array<
    QuoteCandidate & { priceValue: number }
  >
  if (withPrice.length === 0) return undefined
  return withPrice.sort((a, b) => {
    const am = matchesName(item, a) ? 1 : 0
    const bm = matchesName(item, b) ? 1 : 0
    if (bm !== am) return bm - am
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    return a.priceValue - b.priceValue
  })[0]
}

export function buildRunItemResult(input: {
  item: ProcurementItemInput
  candidates: QuoteCandidate[]
  evidences: RunItemResult['evidences']
  warnings: string[]
}): RunItemResult {
  const recommended = pickRecommended(input.item, input.candidates)

  return {
    item: input.item,
    recommended,
    candidates: input.candidates.sort((a, b) => (b.confidence !== a.confidence ? b.confidence - a.confidence : 0)),
    evidences: input.evidences,
    warnings: input.warnings,
  }
}
