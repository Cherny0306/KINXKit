export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'GET' })
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  const json = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!json.success) throw new Error(json.error ?? '请求失败')
  return json.data as T
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  const json = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!json.success) throw new Error(json.error ?? '请求失败')
  return json.data as T
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(path, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  const json = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!json.success) throw new Error(json.error ?? '请求失败')
  return json.data as T
}

