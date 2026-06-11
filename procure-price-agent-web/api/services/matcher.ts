import type { ProcurementItemInput, QuoteCandidate, RunItemResult } from '../../shared/types'

function normalize(s: string | undefined) {
  return (s ?? '').trim().toLowerCase()
}

function matchesCatNo(item: ProcurementItemInput, c: QuoteCandidate) {
  const cat = normalize(item.catNo)
  if (!cat) return false
  const fields = [c.matchedCatNo, c.title, c.url, c.matchedSpec].map((x) => normalize(x))
  return fields.some((f) => f.length > 0 && (f.includes(cat) || cat.includes(f)))
}

function pickRecommended(item: ProcurementItemInput, candidates: QuoteCandidate[]) {
  const withPrice = candidates.filter((c) => c.priceValue != null) as Array<
    QuoteCandidate & { priceValue: number }
  >
  if (withPrice.length === 0) return undefined

  const matched = withPrice.filter((c) => matchesCatNo(item, c))
  const pool = matched.length > 0 ? matched : withPrice

  return pool.sort((a, b) => {
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
  const limitPrice = input.item.limitPrice
  const recommendedPrice = recommended?.priceValue ?? null
  const withinLimit =
    limitPrice != null && recommendedPrice != null ? recommendedPrice <= limitPrice : undefined

  return {
    item: input.item,
    recommended,
    candidates: input.candidates.sort((a, b) => (b.confidence !== a.confidence ? b.confidence - a.confidence : 0)),
    evidences: input.evidences,
    warnings: input.warnings,
    limitCheck: {
      limitPrice,
      recommendedPrice,
      withinLimit,
    },
  }
}
