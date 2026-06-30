import { NextRequest, NextResponse } from 'next/server'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || ''

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, maxTokens = 1024, temperature = 0.7 } = await req.json()

    if (!NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: 'NVIDIA API key not configured' },
        { status: 500 },
      )
    }

    const payload: Record<string, any> = {
      model: 'minimaxai/minimax-m3',
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      max_tokens: Math.min(maxTokens, 512),
      temperature,
      top_p: 0.9,
      stream: false,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      console.error('NVIDIA API error:', response.status, errText)
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
