import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { apiPostForm } from '@/utils/api'
import { useAppStore } from '@/store/useAppStore'
import type { RunRecord, SiteId } from '../../shared/types'
import { FileSpreadsheet, Play, TriangleAlert } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const sites = useAppStore((s) => s.sites)
  const settings = useAppStore((s) => s.settings)
  const setLastRun = useAppStore((s) => s.setLastRun)

  const defaultSites = useMemo<SiteId[]>(
    () => (settings?.enabledSites?.length ? settings.enabledSites : (sites.map((s) => s.siteId) as SiteId[])),
    [settings?.enabledSites, sites],
  )

  const [file, setFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState<string>('请基于公开价格查价，优先匹配货号与规格；如超出限价请标红并给出原因。')
  const [selectedSites, setSelectedSites] = useState<SiteId[]>(defaultSites)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultSites.length > 0 && selectedSites.length === 0) {
      setSelectedSites(defaultSites)
    }
  }, [defaultSites, selectedSites.length])

  async function onSubmit() {
    if (!file) return
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('instructions', instructions)
      form.append('siteIds', selectedSites.join(','))
      const resp = await apiPostForm<{ runId: string; run: RunRecord; parserWarnings: string[] }>(
        '/api/runs',
        form,
      )
      setLastRun(resp.run)
      navigate(`/runs/${resp.runId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">查价工作台</div>
                <div className="mt-0.5 text-xs text-zinc-500">上传清单，填写说明，手动触发一次性查价</div>
              </div>
              <Badge tone="neutral">{selectedSites.length} 站点</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">采购清单（Excel/CSV）</div>
              <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-3 hover:border-zinc-400">
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                  <FileSpreadsheet className="size-4 text-zinc-500" />
                  <span className="truncate">
                    {file ? file.name : '点击选择文件（建议包含：名称/货号/规格/数量/限价）'}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-700">选择</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">采购说明 / 限价策略</div>
              <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              <div className="text-xs text-zinc-500">
                系统只抓公开价，不包含登录价/券后价/协议价；结果会附来源链接与时间戳。
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-zinc-700">启用站点</div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={() => setSelectedSites(defaultSites)}
                >
                  重置
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {sites.map((s) => {
                  const checked = selectedSites.includes(s.siteId)
                  return (
                    <label
                      key={s.siteId}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...selectedSites, s.siteId]))
                              : selectedSites.filter((x) => x !== s.siteId)
                            setSelectedSites(next as SiteId[])
                          }}
                        />
                        <div className="text-sm text-zinc-800">{s.displayName}</div>
                      </div>
                      <Badge tone="neutral">{s.siteId}</Badge>
                    </label>
                  )
                })}
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 size-4" />
                <div className="min-w-0">
                  <div>{error}</div>
                  <div className="mt-1 text-xs text-red-700/80">
                    建议先重试一次；若仍失败，可先取消 `京东` 等较慢站点，或等待本地开发服务稳定后再试。
                  </div>
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              onClick={onSubmit}
              disabled={!file || submitting || selectedSites.length === 0}
              className="w-full"
            >
              <Play className="size-4" />
              {submitting ? '查价中…' : '开始查价'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">使用提示</div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs font-medium text-zinc-800">推荐表头（任意顺序均可）</div>
              <div className="mt-1 text-xs text-zinc-600">
                名称/品名、品牌、货号/Cat No.、规格、数量、限价
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs font-medium text-zinc-800">匹配优先级</div>
              <div className="mt-1 text-xs text-zinc-600">
                货号/Cat No. &gt; 规格 &gt; 名称；无货号时会降低置信度并给出提示。
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <div className="text-xs font-medium text-zinc-800">大站点说明</div>
              <div className="mt-1 text-xs text-zinc-600">
                京东等大站点可能出现风控/结构变化导致无法解析，系统会降级为“需人工打开链接确认”。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
