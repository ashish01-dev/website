import { NextRequest, NextResponse } from 'next/server'
import { AVAILABLE_TOOLS, executeToolCall } from '@/lib/ai-actions'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free'

function buildActionSystemPrompt(): string {
  return `You are an intelligent JEE study assistant integrated into a study platform. You help JEE aspirants with their preparation.

## What you can do
- Answer JEE questions (Physics, Chemistry, Maths)
- Add chapters to the user's daily study plan for any date
- Log questions they completed (count, subject, chapter)
- Log study hours/minutes
- Update chapter progress status
- Show dashboard summary

## When to use your tools
- User says "add X chapter to my plan on Y date" → use add_to_daily_plan
- User says "completed/solved X questions of Y chapter" → use log_questions
- User says "studied for X hours" → use log_study_hours
- User says "mark X chapter as done" → use update_chapter_progress
- User asks "what's my progress" → use get_dashboard_summary
- User just asks a doubt or concept question → answer directly, no tool needed

## Response style
- Be concise, warm, and encouraging
- After using a tool, confirm what was done
- Ask if they need anything else`
}

function buildTools() {
  return AVAILABLE_TOOLS.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, maxTokens = 1024, temperature = 0.7, enableActions = true } = await req.json()

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'AI service key not configured' }, { status: 500 })
    }

    const mergedSystem = systemPrompt
      ? `${systemPrompt}\n\n${enableActions ? buildActionSystemPrompt() : ''}`
      : (enableActions ? buildActionSystemPrompt() : '')

    const openAiMessages: any[] = []
    if (mergedSystem) {
      openAiMessages.push({ role: 'system', content: mergedSystem })
    }
    for (const msg of messages) {
      if (msg.tool_call) {
        openAiMessages.push({
          role: 'tool',
          tool_call_id: msg.tool_call.id || `call_${msg.tool_call.name}`,
          content: JSON.stringify(msg.tool_call.result || { success: false }),
        })
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        openAiMessages.push({ role: 'assistant', content: null, tool_calls: msg.tool_calls })
      } else {
        openAiMessages.push({ role: msg.role === 'assistant' ? 'assistant' : msg.role, content: msg.content })
      }
    }

    const payload: Record<string, any> = {
      model: MODEL,
      messages: openAiMessages,
      max_tokens: Math.min(maxTokens, 1024),
      temperature,
      top_p: 0.9,
    }

    if (enableActions && AVAILABLE_TOOLS.length > 0) {
      payload.tools = buildTools()
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter API error:', response.status, errText)
      const isAuthError = response.status === 400 || response.status === 401 || response.status === 403
      return NextResponse.json({
        error: isAuthError ? 'AI service key is invalid or expired' : 'AI service unavailable',
      }, { status: response.status })
    }

    const data = await response.json()
    const choice = data?.choices?.[0]
    if (!choice) {
      return NextResponse.json({ choices: [{ index: 0, message: { role: 'assistant', content: 'The AI returned an empty response.' } }] })
    }

    const message = choice.message || {}

    if (message.tool_calls && message.tool_calls.length > 0) {
      const results = await Promise.all(message.tool_calls.map(async (tc: any) => {
        const fnName = tc.function.name
        const fnArgs = JSON.parse(tc.function.arguments || '{}')
        return { id: tc.id, name: fnName, args: fnArgs, result: await executeToolCall(fnName, fnArgs) }
      }))

      const followUpMessages = [
        ...openAiMessages,
        { role: 'assistant', content: null, tool_calls: message.tool_calls },
        ...results.map(r => ({
          role: 'tool' as const,
          tool_call_id: r.id,
          content: JSON.stringify(r.result),
        })),
      ]

      const followUpPayload: Record<string, any> = {
        model: MODEL,
        messages: followUpMessages,
        max_tokens: 512,
        temperature,
        top_p: 0.9,
      }
      if (enableActions && AVAILABLE_TOOLS.length > 0) {
        followUpPayload.tools = buildTools()
      }

      const followUpRes = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(followUpPayload),
      })

      if (followUpRes.ok) {
        const fd = await followUpRes.json()
        const fcContent = fd?.choices?.[0]?.message?.content || results[0]?.result?.message || 'Action completed.'
        return NextResponse.json({
          choices: [{ index: 0, message: { role: 'assistant', content: fcContent } }],
          action_results: results,
        })
      }

      return NextResponse.json({
        choices: [{ index: 0, message: { role: 'assistant', content: results.map(r => r.result.message).join('\n') } }],
        action_results: results,
      })
    }

    return NextResponse.json({
      choices: [{ index: 0, message: { role: 'assistant', content: message.content || '' } }],
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
