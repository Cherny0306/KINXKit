import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { parseProcurementFile } from './procurement'

function makeXlsxBuffer(rows: Array<Record<string, unknown>>) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return out
}

describe('parseProcurementFile', () => {
  it('parses common headers', () => {
    const buffer = makeXlsxBuffer([
      { 品名: 'ProClean 150', 品牌: 'Beyotime', 货号: 'ST850-50ml', 规格: '50ml', 数量: 2, 限价: 200 },
    ])
    const { items, warnings } = parseProcurementFile({ filename: 'a.xlsx', buffer })
    expect(warnings.length).toBe(0)
    expect(items.length).toBe(1)
    expect(items[0].rawName).toBe('ProClean 150')
    expect(items[0].brand).toBe('Beyotime')
    expect(items[0].catNo).toBe('ST850-50ml')
    expect(items[0].spec).toBe('50ml')
    expect(items[0].quantity).toBe(2)
    expect(items[0].limitPrice).toBe(200)
  })
})

