type ApiEnvelope<T> = { success: boolean; data?: T; error?: string }

function normalizeKnownErrorMessage(message: string) {
  const lower = String(message ?? '').toLowerCase()
  if (lower.includes('invalid session token') || lower.includes('missing session token')) {
    return '预览会话已失效：请刷新当前预览页面后重试；若仍失败，请重新打开本地预览。'
  }
  return message
}

function friendlyHttpError(status: number) {
  if (status === 504) {
    return '请求超时：后端正在重启或某些站点响应过慢，请稍后重试；若频繁出现，可先减少站点数量。'
  }
  if (status === 502 || status === 503) {
    return '服务暂时不可用：开发服务可能正在重启，请等待 2-5 秒后重试。'
  }
  if (status === 500) {
    return '后端执行失败：请查看结果页中的站点错误，或缩小站点范围后重试。'
  }
  return `请求失败：HTTP ${status}`
}

async function unwrapJson<T>(res: Response): Promise<T> {
  let json: ApiEnvelope<T> | null = null
  try {
    json = (await res.json()) as ApiEnvelope<T>
  } catch {
    json = null
  }

  if (!res.ok) {
    throw new Error(normalizeKnownErrorMessage(json?.error || friendlyHttpError(res.status)))
  }
  if (!json?.success) {
    throw new Error(normalizeKnownErrorMessage(json?.error ?? '请求失败'))
  }
  return json.data as T
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, init)
    return await unwrapJson<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时：请减少站点数量或稍后再试。')
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('无法连接到本地服务：请确认 `npm run dev` 正在运行。')
      }
      throw new Error(normalizeKnownErrorMessage(error.message))
    }
    throw new Error('请求失败')
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: form })
}
