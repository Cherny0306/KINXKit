import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet } from '@/utils/api'
import type { RunRecord } from '../../shared/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, getButtonClassName } from '@/components/ui/Button'
import { Download, ExternalLink } from 'lucide-react'

function money(n: number | null | undefined) {
  if (n == null) return '未知'
  return `¥${n.toFixed(2)}`
}

export default function Run() {
  const { runId } = useParams()
  const [run, setRun] = useState<RunRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!runId) return
    const load = async () => {
      try {
        const r = await apiGet<RunRecord>(`/api/runs/${runId}`)
        if (!cancelled) setRun(r)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      }
    }
    void load()
    const timer = setInterval(async () => {
      try {
        const latest = await apiGet<RunRecord>(`/api/runs/${runId}`)
        if (cancelled) return
        setRun(latest)
        if (latest.status === 'succeeded' || latest.status === 'failed') {
          clearInterval(timer)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败')
          clearInterval(timer)
        }
      }
    }, 1500)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [runId])

  const stats = useMemo(() => {
    if (!run) return null
    const total = run.totalItems
    const ok = run.items.filter((i) => i.recommended?.priceValue != null).length
    const over = run.items.filter((i) => i.limitCheck?.withinLimit === false).length
    const progress = run.totalItems > 0 ? Math.round((run.completedItems / run.totalItems) * 100) : 0
    return { total, ok, over, progress }
  }, [run])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">任务加载失败</div>
        </CardHeader>
        <CardContent className="text-sm text-zinc-700">{error}</CardContent>
      </Card>
    )
  }

  if (!run) {
    return (
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">加载中</div>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">正在读取任务结果…</CardContent>
      </Card>
    )
  }

  const artifactsReady = run.status === 'succeeded'
  const downloadLinkClassName = getButtonClassName({ variant: 'secondary', className: 'h-9' })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">查价结果</div>
              <div className="mt-0.5 text-xs text-zinc-500">任务ID：{run.id}</div>
            </div>
            <div className="flex items-center gap-2">
              {stats ? (
                <>
                  <Badge tone="neutral">{stats.total} 物料</Badge>
                  <Badge tone={stats.ok === stats.total ? 'good' : 'warn'}>{stats.ok} 有价</Badge>
                  <Badge tone={stats.over > 0 ? 'bad' : 'good'}>{stats.over} 超限</Badge>
                  <Badge tone={run.status === 'failed' ? 'bad' : run.status === 'succeeded' ? 'good' : 'warn'}>
                    {run.status === 'queued' ? '排队中' : run.status === 'running' ? `执行中 ${stats.progress}%` : run.status === 'failed' ? '执行失败' : '已完成'}
                  </Badge>
                </>
              ) : null}
              {artifactsReady ? (
                <a href={`/api/runs/${run.id}/export.csv`} target="_blank" rel="noreferrer" className={downloadLinkClassName}>
                  <Download className="size-4" />
                  CSV
                </a>
              ) : (
                <Button variant="secondary" className="h-9" disabled title={run.status === 'failed' ? '任务失败，CSV 不可用' : '任务完成后可下载 CSV'}>
                  <Download className="size-4" />
                  {run.status === 'failed' ? 'CSV 不可用' : 'CSV 生成中'}
                </Button>
              )}
              {artifactsReady ? (
                <a href={`/api/runs/${run.id}/report.md`} target="_blank" rel="noreferrer" className={downloadLinkClassName}>
                  <Download className="size-4" />
                  报告
                </a>
              ) : (
                <Button
                  variant="secondary"
                  className="h-9"
                  disabled
                  title={run.status === 'failed' ? '任务失败，报告不可用' : '任务完成后可下载报告'}
                >
                  <Download className="size-4" />
                  {run.status === 'failed' ? '报告不可用' : '报告生成中'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-zinc-700">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs text-zinc-500">启用站点</div>
              <div className="mt-1 text-sm">{run.siteIds.join(', ')}</div>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs text-zinc-500">开始时间</div>
              <div className="mt-1 text-sm">{run.createdAt}</div>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs text-zinc-500">任务进度</div>
              <div className="mt-1 text-sm">
                {run.completedItems}/{run.totalItems}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs text-zinc-500">结束时间</div>
              <div className="mt-1 text-sm">{run.finishedAt ?? '—'}</div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all"
              style={{ width: `${run.totalItems > 0 ? (run.completedItems / run.totalItems) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">站点执行状态</div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {run.siteSummaries.map((site) => {
            const tone =
              site.state === 'ok' ? 'good' : site.state === 'failed' ? 'bad' : site.state === 'partial' ? 'warn' : 'neutral'
            const label =
              site.state === 'ok' ? '正常' : site.state === 'failed' ? '失败' : site.state === 'partial' ? '部分降级' : '未执行'
            return (
              <div key={site.siteId} className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{site.siteId}</div>
                  <Badge tone={tone}>{label}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600">
                  <div>请求数：{site.totalQueries}</div>
                  <div>缓存：{site.cachedCount}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={site.successCount > 0 ? 'good' : 'neutral'}>成功 {site.successCount}</Badge>
                  <Badge tone={site.emptyCount > 0 ? 'warn' : 'neutral'}>空结果 {site.emptyCount}</Badge>
                  <Badge tone={site.timeoutCount > 0 ? 'bad' : 'neutral'}>超时 {site.timeoutCount}</Badge>
                  <Badge tone={site.errorCount > 0 ? 'bad' : 'neutral'}>错误 {site.errorCount}</Badge>
                </div>
                {site.lastMessage ? (
                  <div className="mt-2 rounded-md bg-zinc-50 px-2 py-1 text-xs text-zinc-700">{site.lastMessage}</div>
                ) : null}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">推荐清单</div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="min-w-[980px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                <th className="w-32 py-2">品牌</th>
                <th className="w-40 py-2">货号/Cat No.</th>
                <th className="w-40 py-2">规格</th>
                <th className="w-[360px] py-2">物料描述</th>
                <th className="w-20 py-2 text-right">限价</th>
                <th className="w-20 py-2 text-right">推荐价</th>
                <th className="w-20 py-2">状态</th>
                <th className="w-40 py-2">来源</th>
              </tr>
            </thead>
            <tbody>
              {run.items.map((r, idx) => {
                const within = r.limitCheck?.withinLimit
                const tone = within === false ? 'bad' : within === true ? 'good' : 'neutral'
                return (
                  <tr key={idx} className="border-b border-zinc-100 align-top">
                    <td className="py-3 pr-3">{r.item.brand ?? ''}</td>
                    <td className="py-3 pr-3 font-mono text-xs">{r.item.catNo ?? ''}</td>
                    <td className="py-3 pr-3">{r.item.spec ?? ''}</td>
                    <td className="py-3 pr-3">{r.item.rawName}</td>
                    <td className="py-3 pr-3 text-right">{money(r.item.limitPrice ?? null)}</td>
                    <td className="py-3 pr-3 text-right">{money(r.recommended?.priceValue ?? null)}</td>
                    <td className="py-3 pr-3">
                      <Badge tone={tone}>
                        {within === false ? '超限' : within === true ? '未超限' : '未判定'}
                      </Badge>
                      {r.warnings.length ? (
                        <div className="mt-1 text-xs text-zinc-500">{r.warnings.join('；')}</div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">
                      {r.recommended ? (
                        <a
                          className="inline-flex items-center gap-1 text-zinc-900 underline-offset-4 hover:underline"
                          href={r.recommended.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {r.recommended.siteId}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">候选与证据链</div>
        </CardHeader>
        <CardContent className="space-y-3">
          {run.items.map((r, idx) => (
            <details key={idx} className="rounded-lg border border-zinc-200 bg-white p-3">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 text-sm">
                    <span className="font-medium">{r.item.rawName}</span>
                    {r.item.catNo ? <span className="ml-2 font-mono text-xs text-zinc-500">{r.item.catNo}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{r.candidates.length} 候选</Badge>
                    <Badge tone="neutral">{r.evidences.length} 证据</Badge>
                  </div>
                </div>
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-zinc-50 p-3">
                  <div className="text-xs font-medium text-zinc-700">候选报价</div>
                  <div className="mt-2 space-y-2">
                    {r.candidates.slice(0, 12).map((c, i) => (
                      <div key={i} className="rounded-md border border-zinc-200 bg-white p-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-xs text-zinc-500">{c.siteId}</div>
                            <div className="truncate">{c.title}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                              <span className="font-mono">{c.matchedCatNo ?? ''}</span>
                              <span>{c.matchedSpec ?? ''}</span>
                              {c.stockText ? <span>{c.stockText}</span> : null}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-sm font-semibold">{money(c.priceValue)}</div>
                            <div className="text-xs text-zinc-500">置信度 {Math.round(c.confidence * 100)}%</div>
                          </div>
                        </div>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-900 underline-offset-4 hover:underline"
                        >
                          打开来源
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <div className="text-xs font-medium text-zinc-700">证据链（快照）</div>
                  <div className="mt-2 space-y-2">
                    {r.evidences.slice(0, 12).map((e, i) => (
                      <div key={i} className="rounded-md border border-zinc-200 bg-white p-2 text-xs text-zinc-700">
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="neutral">{e.siteId}</Badge>
                          <span className="text-zinc-500">{e.fetchedAt}</span>
                        </div>
                        <div className="mt-2 text-zinc-800">{e.snapshotText}</div>
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-900 underline-offset-4 hover:underline"
                        >
                          打开页面
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      {run.errors.length ? (
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">站点错误</div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-700">
            {run.errors.slice(0, 20).map((e, i) => (
              <div key={i} className="rounded-lg bg-zinc-50 px-3 py-2">
                <span className="font-mono text-xs text-zinc-500">{e.siteId}</span>
                {e.type ? <span className="ml-2 text-xs text-zinc-400">[{e.type}]</span> : null}
                {e.itemName ? <span className="ml-2 text-xs text-zinc-400">{e.itemName}</span> : null}
                <span className="ml-2">{e.message}</span>
                {e.query ? <div className="mt-1 text-xs text-zinc-500">查询词：{e.query}</div> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
