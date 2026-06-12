import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '@/utils/api'
import type { RunListItem } from '../../shared/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExternalLink, RefreshCcw } from 'lucide-react'

function fmtTime(s: string) {
  if (!s) return '—'
  return s.replace('T', ' ').replace('Z', '')
}

function toneForStatus(status: RunListItem['status']) {
  if (status === 'succeeded') return 'good'
  if (status === 'failed') return 'bad'
  return 'warn'
}

function labelForStatus(status: RunListItem['status']) {
  if (status === 'queued') return '排队中'
  if (status === 'running') return '执行中'
  if (status === 'failed') return '失败'
  return '已完成'
}

export default function History() {
  const [runs, setRuns] = useState<RunListItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const list = await apiGet<RunListItem[]>('/api/runs?limit=80')
      setRuns(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const stats = useMemo(() => {
    if (!runs) return null
    const total = runs.length
    const succeeded = runs.filter((r) => r.status === 'succeeded').length
    const failed = runs.filter((r) => r.status === 'failed').length
    const running = runs.filter((r) => r.status === 'running' || r.status === 'queued').length
    return { total, succeeded, failed, running }
  }, [runs])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">历史记录</div>
              <div className="mt-0.5 text-xs text-zinc-500">保留每次查价的完整任务、候选、证据链与报告</div>
            </div>
            <div className="flex items-center gap-2">
              {stats ? (
                <>
                  <Badge tone="neutral">{stats.total} 条</Badge>
                  <Badge tone="good">{stats.succeeded} 完成</Badge>
                  <Badge tone="warn">{stats.running} 进行中</Badge>
                  <Badge tone="bad">{stats.failed} 失败</Badge>
                </>
              ) : null}
              <Button variant="secondary" className="h-9" onClick={load} disabled={loading}>
                <RefreshCcw className="size-4" />
                刷新
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          {error ? <div className="text-sm text-red-700">{error}</div> : null}
          {!runs && !error ? <div className="text-sm text-zinc-600">加载中…</div> : null}
          {runs && runs.length === 0 ? <div className="text-sm text-zinc-600">暂无历史记录</div> : null}
          {runs && runs.length > 0 ? (
            <table className="min-w-[980px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                  <th className="w-44 py-2">时间</th>
                  <th className="w-28 py-2">状态</th>
                  <th className="w-48 py-2">站点</th>
                  <th className="w-40 py-2">进度</th>
                  <th className="w-32 py-2">结果</th>
                  <th className="w-[360px] py-2">说明</th>
                  <th className="w-28 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 align-top">
                    <td className="py-3 pr-3">
                      <div className="text-sm">{fmtTime(r.createdAt)}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">结束：{r.finishedAt ? fmtTime(r.finishedAt) : '—'}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge tone={toneForStatus(r.status)}>{labelForStatus(r.status)}</Badge>
                    </td>
                    <td className="py-3 pr-3 text-xs text-zinc-700">{r.siteIds.join(', ')}</td>
                    <td className="py-3 pr-3 text-xs text-zinc-700">
                      {r.completedItems}/{r.totalItems}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={r.okCount > 0 ? 'good' : 'neutral'}>有价 {r.okCount}</Badge>
                        <Badge tone={r.errorCount > 0 ? 'bad' : 'neutral'}>错误 {r.errorCount}</Badge>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-xs text-zinc-700">{r.instructionsPreview || '（无）'}</td>
                    <td className="py-3 pr-3">
                      <Link
                        to={`/runs/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-zinc-900 underline-offset-4 hover:underline"
                      >
                        打开
                        <ExternalLink className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
