export async function fetchText(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs: number },
): Promise<{ status: number; text: string; finalUrl: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs)
  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: opts.headers,
      body: opts.body,
      redirect: 'follow',
      signal: controller.signal,
    })
    const text = await res.text()
    return { status: res.status, text, finalUrl: res.url }
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchJson<T>(
  url: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs: number },
): Promise<{ status: number; json: T; finalUrl: string }> {
  const { status, text, finalUrl } = await fetchText(url, opts)
  return { status, json: JSON.parse(text) as T, finalUrl }
}

