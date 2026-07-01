import { NextRequest, NextResponse } from 'next/server'
import { AVAILABLE_TOOLS, executeToolCall } from '@/lib/ai-actions'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function buildGeminiContents(messages: { role: string; content?: string; tool_call?: { name: string; args: any; result?: any } }[]) {
  const contents: any[] = []
  let pendingFunctionResult: any = null

  for (const msg of messages) {
    if ((msg as any).tool_call) {
      /* Function result from executing a tool */
      const tc = (msg as any).tool_call
      pendingFunctionResult = {
        role: 'function',
        parts: [{
          functionResponse: {
            name: tc.name,
            response: {
              name: tc.name,
              content: tc.result || { success: false, message: 'No result' },
            },
          },
        }],
      }
      continue
    }

    if (msg.role === 'assistant' && (msg as any).tool_call) {
      /* Model's function call response */
      const tc = (msg as any).tool_call
      const parts: any[] = []
      if (msg.content) parts.push({ text: msg.content })
      parts.push({ functionCall: { name: tc.name, args: tc.args } })
      contents.push({ role: 'model', parts })
      if (pendingFunctionResult) {
        contents.push(pendingFunctionResult)
        pendingFunctionResult = null
      }
      continue
    }

    contents.push({
      role: msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : msg.role,
      parts: [{ text: msg.content || '' }],
    })
  }

  if (pendingFunctionResult) contents.push(pendingFunctionResult)

  return contents
}

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

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, maxTokens = 1024, temperature = 0.7, enableActions = true } = await req.json()

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service key not configured' }, { status: 500 })
    }

    const mergedSystem = systemPrompt
      ? `${systemPrompt}\n\n${enableActions ? buildActionSystemPrompt() : ''}`
      : (enableActions ? buildActionSystemPrompt() : '')

    const contents = buildGeminiContents(messages)

    const payload: Record<string, any> = {
      contents,
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens, 1024),
        temperature,
        topP: 0.9,
      },
    }

    if (mergedSystem) {
      payload.systemInstruction = { parts: [{ text: mergedSystem }] }
    }

    if (enableActions && AVAILABLE_TOOLS.length > 0) {
      payload.tools = [{
        functionDeclarations: AVAILABLE_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      }]
    }

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
      const isAuthError = response.status === 400 || response.status === 401 || response.status === 403
      return NextResponse.json({
        error: isAuthError ? 'AI service key is invalid or expired' : 'AI service unavailable',
      }, { status: response.status })
    }

    const data = await response.json()
    const candidate = data?.candidates?.[0]
    if (!candidate) {
      return NextResponse.json({ choices: [{ index: 0, message: { role: 'assistant', content: 'I couldn\'t process that. Please try again.' } }] })
    }

    const parts = candidate.content?.parts || []
    const textPart = parts.find((p: any) => p.text)?.text || ''
    const fcPart = parts.find((p: any) => p.functionCall)

    /* If the model wants to call a function */
    if (fcPart) {
      const fc = fcPart.functionCall
      const fnName = fc.name
      const fnArgs = fc.args || {}

      const result = await executeToolCall(fnName, fnArgs)

      /* Build follow-up with function result */
      const followUpMessages = [
        ...messages,
        { role: 'assistant' as const, content: textPart || null, tool_call: { name: fnName, args: fnArgs } },
        { role: 'function' as const, tool_call: { name: fnName, args: fnArgs, result } },
      ]

      const followUpContents = buildGeminiContents(followUpMessages)
      const followUpPayload: Record<string, any> = {
        contents: followUpContents,
        generationConfig: { maxOutputTokens: 512, temperature, topP: 0.9 },
      }
      if (mergedSystem) followUpPayload.systemInstruction = { parts: [{ text: mergedSystem }] }

      const followUpRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpPayload),
        signal: AbortSignal.timeout(15000),
      })

      if (followUpRes.ok) {
        const fd = await followUpRes.json()
        const fcText = fd?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || result.message
        return NextResponse.json({
          choices: [{ index: 0, message: { role: 'assistant', content: fcText } }],
          action_result: result,
        })
      }

      /* Fallback: return action result as text */
      return NextResponse.json({
        choices: [{ index: 0, message: { role: 'assistant', content: result.message } }],
        action_result: result,
      })
    }

    /* Normal text response */
    return NextResponse.json({
      choices: [{ index: 0, message: { role: 'assistant', content: textPart } }],
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
