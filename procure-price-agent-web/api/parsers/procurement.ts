import * as XLSX from 'xlsx'
import type { ProcurementItemInput } from '../../shared/types'

function normalizeHeader(s: string) {
  return String(s ?? '').trim().toLowerCase()
}

function pickHeader(headers: string[], re: RegExp): string | null {
  for (const h of headers) {
    if (re.test(h)) return h
  }
  return null
}

function parseNumber(v: unknown): number | undefined {
  if (v == null) return undefined
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const s = String(v).replace(/[,\\s]/g, '')
  const m = s.match(/([0-9]+(?:\\.[0-9]+)?)/)
  if (!m) return undefined
  const n = Number(m[1])
  return Number.isFinite(n) ? n : undefined
}

export function parseProcurementFile(input: { filename: string; buffer: Buffer }): {
  items: ProcurementItemInput[]
  warnings: string[]
} {
  const workbook = XLSX.read(input.buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  const headers = (rows[0] ? Object.keys(rows[0]) : []).map((h) => normalizeHeader(h))
  const keyMap = new Map<string, string>()

  const rawHeaders = rows[0] ? Object.keys(rows[0]) : []
  const normalizedToRaw = new Map<string, string>()
  for (const h of rawHeaders) normalizedToRaw.set(normalizeHeader(h), h)

  const rawNameKey = pickHeader(headers, /(名称|品名|物料|产品|商品|name|item)/i)
  const brandKey = pickHeader(headers, /(品牌|brand)/i)
  const catNoKey = pickHeader(headers, /(货号|cat|catalog|产品编号|编号)/i)
  const specKey = pickHeader(headers, /(规格|包装|spec|pack)/i)
  const qtyKey = pickHeader(headers, /(数量|qty|quantity|num)/i)
  const limitKey = pickHeader(headers, /(限价|最高价|预算|max\\s*price|limit)/i)

  if (rawNameKey) keyMap.set('rawName', normalizedToRaw.get(rawNameKey)!)
  if (brandKey) keyMap.set('brand', normalizedToRaw.get(brandKey)!)
  if (catNoKey) keyMap.set('catNo', normalizedToRaw.get(catNoKey)!)
  if (specKey) keyMap.set('spec', normalizedToRaw.get(specKey)!)
  if (qtyKey) keyMap.set('quantity', normalizedToRaw.get(qtyKey)!)
  if (limitKey) keyMap.set('limitPrice', normalizedToRaw.get(limitKey)!)

  const warnings: string[] = []
  if (!rawNameKey && !catNoKey) {
    warnings.push('未识别到“名称/品名/物料”或“货号/Cat No.”列，匹配准确度可能较低')
  }

  const items: ProcurementItemInput[] = rows
    .map((r) => {
      const rawName = String(keyMap.get('rawName') ? r[keyMap.get('rawName')!] : '').trim()
      const brand = String(keyMap.get('brand') ? r[keyMap.get('brand')!] : '').trim() || undefined
      const catNo = String(keyMap.get('catNo') ? r[keyMap.get('catNo')!] : '').trim() || undefined
      const spec = String(keyMap.get('spec') ? r[keyMap.get('spec')!] : '').trim() || undefined
      const quantity = parseNumber(keyMap.get('quantity') ? r[keyMap.get('quantity')!] : undefined)
      const limitPrice = parseNumber(keyMap.get('limitPrice') ? r[keyMap.get('limitPrice')!] : undefined)

      const fallbackName = rawName || catNo || spec || ''
      if (!fallbackName) return null

      return {
        rawName: rawName || fallbackName,
        brand,
        catNo,
        spec,
        quantity,
        limitPrice,
      } satisfies ProcurementItemInput
    })
    .filter(Boolean) as ProcurementItemInput[]

  if (items.length === 0) warnings.push('清单解析结果为空，请检查表头与内容是否完整')
  return { items, warnings }
}

