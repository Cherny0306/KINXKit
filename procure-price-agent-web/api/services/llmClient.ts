import type { ModelConfig } from '../../shared/types'
import { fetchJson } from '../utils/http.js'

function buildEndpoint(baseUrl: string) {
  const b = baseUrl.replace(/\/+$/, '')
  if (b.endsWith('/chat/completions')) return b
  if (b.endsWith('/v1') || b.endsWith('/v4')) return `${b}/chat/completions`
  return `${b}/v1/chat/completions`
}

export async function chatOnce(input: {
  model: ModelConfig
  prompt: string
  timeoutMs: number
}): Promise<string> {
  const endpoint = buildEndpoint(input.model.baseUrl || 'https://api.openai.com/v1')
  const { status, json } = await fetchJson<{
    choices?: Array<{ message?: { content?: string } }>
    error?: { message?: string; code?: string }
  }>(endpoint, {
    method: 'POST',
    timeoutMs: input.timeoutMs,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${input.model.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model.model,
      messages: [
        {
          role: 'user',
          content: input.prompt,
        },
      ],
      temperature: 0.2,
    }),
  })

  const maybeErrorMessage =
    json.error?.message ||
    (json as unknown as { message?: string }).message ||
    (json as unknown as { error?: string }).error

  if (status >= 400) {
    const msg = maybeErrorMessage ? String(maybeErrorMessage) : `HTTP ${status}`
    const lower = msg.toLowerCase()
    if (lower.includes('余额不足') || lower.includes('无可用资源包')) {
      throw new Error('模型余额不足或无可用资源包，请充值或更换可用模型')
    }
    if (lower.includes('unauthorized') || lower.includes('apikey') || lower.includes('invalid') || lower.includes('鉴权')) {
      throw new Error('模型鉴权失败：请检查 base_url / api_key / model 是否正确')
    }
    if (status === 429) {
      throw new Error(`模型请求被限流：${msg}`)
    }
    throw new Error(`模型请求失败：${msg}`)
  }

  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('模型未返回有效内容')
  return content
}
