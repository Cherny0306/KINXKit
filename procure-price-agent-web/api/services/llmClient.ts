import type { ModelConfig } from '../../shared/types'
import { fetchJson } from '../utils/http.js'

function buildEndpoint(baseUrl: string) {
  const b = baseUrl.replace(/\/+$/, '')
  if (b.endsWith('/v1')) return `${b}/chat/completions`
  return `${b}/v1/chat/completions`
}

export async function chatOnce(input: {
  model: ModelConfig
  prompt: string
  timeoutMs: number
}): Promise<string> {
  const endpoint = buildEndpoint(input.model.baseUrl || 'https://api.openai.com/v1')
  const { json } = await fetchJson<{
    choices?: Array<{ message?: { content?: string } }>
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

  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('模型未返回有效内容')
  return content
}

