import type { AppSettings, RunRecord, RunItemResult } from '../../shared/types'
import { chatOnce } from './llmClient.js'

function fmtMoney(n: number | null | undefined) {
  if (n == null) return '未知'
  return `¥${n.toFixed(2)}`
}

function lineSafe(s: string) {
  return String(s ?? '').replace(/\r?\n/g, ' ').trim()
}

function toTableRow(r: RunItemResult) {
  const item = r.item
  return `| ${lineSafe(item.brand ?? '')} | ${lineSafe(item.catNo ?? '')} | ${lineSafe(
    item.spec ?? '',
  )} | ${lineSafe(item.rawName)} | ${item.quantity ?? ''} | ${fmtMoney(item.limitPrice ?? null)} | ${
    r.recommended ? lineSafe(r.recommended.siteId) : ''
  } | ${fmtMoney(r.recommended?.priceValue ?? null)} | ${r.recommended ? lineSafe(r.recommended.url) : ''} |`
}

export async function generateReportMd(input: {
  run: RunRecord
  settings: AppSettings
}): Promise<string> {
  const base = [
    `# 采购查价说明`,
    ``,
    `- 任务ID：${input.run.id}`,
    `- 生成时间：${new Date().toISOString()}`,
    `- 启用站点：${input.run.siteIds.join(', ')}`,
    ``,
    `## 输入说明`,
    ``,
    input.run.instructions ? input.run.instructions.trim() : '（无）',
    ``,
    `## 价格清单（推荐项）`,
    ``,
    `| 品牌 | 货号/Cat No. | 规格 | 物料描述 | 数量 | 限价 | 推荐站点 | 推荐价 | 来源链接 |`,
    `|---|---|---|---|---:|---:|---|---:|---|`,
    ...input.run.items.map(toTableRow),
    ``,
    `## 备注与风险提示`,
    ``,
    `- 本报告仅基于公开可见价格抓取生成，不包含登录价/券后到手价/协议价。`,
    `- 若出现“未知价格/询价/0元”等情况，建议人工打开来源链接确认口径，或更换站点重试。`,
    `- 每条记录均附抓取时间戳与来源链接，便于审计与复核。`,
    ``,
  ].join('\n')

  const model = input.settings.model
  const hasModel = Boolean(model.apiKey && model.baseUrl && model.model)
  if (!hasModel) return base

  const summary = input.run.items
    .map((i) => {
      const cat = i.item.catNo ? `货号${i.item.catNo}` : ''
      const rec = i.recommended ? `${i.recommended.siteId} ${fmtMoney(i.recommended.priceValue)}` : '无推荐'
      const limit = i.item.limitPrice != null ? `限价${fmtMoney(i.item.limitPrice)}` : '无单项限价'
      const within = i.limitCheck?.withinLimit
      const limitText = within === undefined ? '' : within ? '（未超限）' : '（超限）'
      return `${i.item.rawName} ${cat} ${rec} ${limit}${limitText}`.trim()
    })
    .join('\n')

  const prompt = [
    `你是采购查价助手，请基于以下查价结果，为采购人员生成一段“详细说明”，要求：`,
    `1) 用中文；2) 解释推荐逻辑与限价判断；3) 标出需要人工确认的风险点；4) 不要编造不存在的价格；5) 保持精炼（300-600字）。`,
    ``,
    `查价结果摘要：`,
    summary,
  ].join('\n')

  try {
    const llmText = await chatOnce({ model, prompt, timeoutMs: input.settings.scrape.timeoutMs })
    return `${base}\n## 模型生成的补充说明\n\n${llmText.trim()}\n`
  } catch {
    return base
  }
}

