import { NextRequest, NextResponse } from 'next/server'
import { AVAILABLE_TOOLS, executeToolCall } from '@/lib/ai-actions'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface ChatMessage {
  role: 'user' | 'assistant' | 'model'
  content: string
}

function transformToGemini(messages: ChatMessage[], systemPrompt: string, tools: any[]) {
  const contents = messages.map((m: ChatMessage) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }))

  const payload: Record<string, any> = {
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
      topP: 0.9,
    },
  }

  if (systemPrompt) {
    payload.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  if (tools.length > 0) {
    payload.tools = [{
      functionDeclarations: tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      })),
    }]
  }

  return payload
}

function transformFromGemini(geminiResponse: any): any {
  const candidate = geminiResponse?.candidates?.[0]
  if (!candidate) return { choices: [] }

  const content = candidate.content?.parts?.[0]
  const text = content?.text || ''
  const fc = candidate.content?.parts?.[1]?.functionCall || candidate.content?.parts?.[0]?.functionCall

  if (fc) {
    return {
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: fc.name,
            type: 'function',
            function: {
              name: fc.name,
              arguments: JSON.stringify(fc.args || {}),
            },
          }],
        },
      }],
    }
  }

  return {
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: text,
      },
    }],
  }
}

function buildActionSystemPrompt(): string {
  return `You are an intelligent JEE study assistant integrated into a study platform. You can help students with their preparation by answering questions AND performing actions on their behalf.

## Available Actions
You have access to tools that let you:
- Add chapters to the daily plan for specific dates
- Log questions solved (count, subject, chapter)
- Log study hours/minutes
- Update chapter progress status
- Get a summary of the user dashboard

## When to use tools
- If the user asks to ADD, SCHEDULE, or PLAN something → use add_to_daily_plan
- If the user says they COMPLETED or SOLVED questions → use log_questions
- If the user mentions study time/hours → use log_study_hours
- If the user marks a chapter as done → use update_chapter_progress
- If the user asks "what is my progress" or status → use get_dashboard_summary

## Response style
- Be concise and encouraging
- Confirm what you did after using a tool
- Use markdown formatting sparingly
- Always ask if they need anything else after completing a request`
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, maxTokens = 1024, temperature = 0.7, enableActions = true } = await req.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service key not configured' }, { status: 500 })
    }

    const mergedSystem = systemPrompt
      ? `${systemPrompt}\n\n${enableActions ? buildActionSystemPrompt() : ''}`
      : (enableActions ? buildActionSystemPrompt() : '')

    const tools = enableActions ? AVAILABLE_TOOLS : []

    const payload = transformToGemini(messages, mergedSystem, tools)
    payload.generationConfig.maxOutputTokens = Math.min(maxTokens, 1024)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: response.status })
    }

    const geminiData = await response.json()
    const transformed = transformFromGemini(geminiData)

    /* Process tool calls if present */
    const toolCall = transformed?.choices?.[0]?.message?.tool_calls?.[0]
    if (toolCall) {
      const fnName = toolCall.function.name
      const fnArgs = JSON.parse(toolCall.function.arguments || '{}')
      const result = await executeToolCall(fnName, fnArgs)

      /* Send the tool result back to the AI for final response */
      const updatedMessages = [
        ...messages,
        { role: 'user' as const, content: messages[messages.length - 1]?.content || '' },
        { role: 'assistant' as const, content: `I called the function ${fnName} with ${JSON.stringify(fnArgs)}. Result: ${JSON.stringify(result)}` },
      ]

      const followUpPayload = transformToGemini(updatedMessages, mergedSystem, [])
      followUpPayload.generationConfig.maxOutputTokens = 512

      const followUpRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpPayload),
        signal: AbortSignal.timeout(15000),
      })

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json()
        const followUpTransformed = transformFromGemini(followUpData)
        const finalText = followUpTransformed?.choices?.[0]?.message?.content || result.message
        return NextResponse.json({
          choices: [{ index: 0, message: { role: 'assistant', content: finalText } }],
          action_result: result,
        })
      }

      /* If follow-up fails, just return the action result as text */
      return NextResponse.json({
        choices: [{ index: 0, message: { role: 'assistant', content: result.message } }],
        action_result: result,
      })
    }

    return NextResponse.json(transformed)
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
