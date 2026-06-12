import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { apiGet, apiPut } from '@/utils/api'
import { useAppStore } from '@/store/useAppStore'
import type { AppSettings, SiteId } from '../../shared/types'
import { KeyRound, Save } from 'lucide-react'

export default function Settings() {
  const storeSettings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const sites = useAppStore((s) => s.sites)

  const [local, setLocal] = useState<AppSettings | null>(storeSettings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (storeSettings) setLocal(storeSettings)
  }, [storeSettings])

  const enabledSet = useMemo(() => new Set(local?.enabledSites ?? []), [local?.enabledSites])

  async function reload() {
    const s = await apiGet<AppSettings>('/api/settings')
    setSettings(s)
    setLocal(s)
  }

  useEffect(() => {
    if (storeSettings) return
    reload().catch(() => {})
  }, [storeSettings])

  async function onSave() {
    if (!local) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const next = await apiPut<AppSettings>('/api/settings', local)
      setSettings(next)
      setLocal(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (!local) {
    return (
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">设置</div>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">加载中…</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-7">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">模型配置（可选）</div>
                <div className="mt-0.5 text-xs text-zinc-500">用于生成“补充说明”，不配置也能正常查价</div>
              </div>
              <Badge tone="neutral">
                {local.model.apiKey ? '已配置' : '未配置'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">base_url</div>
              <Input
                value={local.model.baseUrl}
                onChange={(e) => setLocal({ ...local, model: { ...local.model, baseUrl: e.target.value } })}
                placeholder="https://xxx/v1 或 https://open.bigmodel.cn/api/paas/v4/"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">model</div>
              <Input
                value={local.model.model}
                onChange={(e) => setLocal({ ...local, model: { ...local.model, model: e.target.value } })}
                placeholder="qwen-plus / glm-4.5 / deepseek-chat ..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-zinc-500" />
                <div className="text-xs font-medium text-zinc-700">api_key</div>
              </div>
              <Input
                type="password"
                value={local.model.apiKey}
                onChange={(e) => setLocal({ ...local, model: { ...local.model, apiKey: e.target.value } })}
                placeholder="不会在前端保存到日志；仅写入本地settings.json"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">抓取与站点</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-700">超时(ms)</div>
                <Input
                  value={String(local.scrape.timeoutMs)}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      scrape: { ...local.scrape, timeoutMs: Number(e.target.value || 0) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-700">每站TopK</div>
                <Input
                  value={String(local.scrape.maxCandidatesPerSite)}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      scrape: { ...local.scrape, maxCandidatesPerSite: Number(e.target.value || 0) },
                    })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <div className="text-xs font-medium text-zinc-700">缓存TTL(分钟)</div>
                <Input
                  value={String(local.scrape.cacheTtlMinutes)}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      scrape: { ...local.scrape, cacheTtlMinutes: Number(e.target.value || 0) },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700">启用站点</div>
              <div className="space-y-2">
                {sites.map((s) => {
                  const checked = enabledSet.has(s.siteId)
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
                              ? Array.from(new Set([...(local.enabledSites ?? []), s.siteId]))
                              : (local.enabledSites ?? []).filter((x) => x !== s.siteId)
                            setLocal({ ...local, enabledSites: next as SiteId[] })
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

            {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}

            <div className="flex items-center gap-2">
              <Button type="button" onClick={onSave} disabled={saving} className="flex-1">
                <Save className="size-4" />
                {saving ? '保存中…' : '保存设置'}
              </Button>
              {saved ? <Badge tone="good">已保存</Badge> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
