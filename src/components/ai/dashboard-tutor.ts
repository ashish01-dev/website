export interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode?: TutorMode
  sources?: string[]
  timestamp: number
}

export type TutorMode =
  | 'ask_doubt'
  | 'explain'
  | 'solve'
  | 'formula_revision'
  | 'quick_summary'
  | 'quiz'
  | 'practice'
  | 'error_analysis'

export const TUTOR_MODES: { id: TutorMode; label: string; icon: string; description: string }[] = [
  { id: 'ask_doubt', label: 'Ask Doubt', icon: '❓', description: 'Get step-by-step help on any problem' },
  { id: 'explain', label: 'Explain Concept', icon: '📖', description: 'Clear, structured concept explanations' },
  { id: 'solve', label: 'Solve Numericals', icon: '🧮', description: 'Worked solutions with formula breakdown' },
  { id: 'formula_revision', label: 'Formula Revision', icon: '📝', description: 'Quick formula sheets for any chapter' },
  { id: 'quick_summary', label: 'Quick Summary', icon: '📋', description: 'Concise chapter summaries' },
  { id: 'quiz', label: 'Quiz Me', icon: '🎯', description: 'Test your knowledge with AI-generated questions' },
  { id: 'practice', label: 'Practice Questions', icon: '📄', description: 'Generate practice problems with solutions' },
  { id: 'error_analysis', label: 'Error Analysis', icon: '🔍', description: 'Analyze mistakes and find weak areas' },
]

export const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'] as const
export type Subject = typeof SUBJECTS[number]

export function generateTutorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function buildPrompt(mode: TutorMode, query: string, context?: { subject?: string; chapter?: string; recentTopics?: string[] }) {
  const modePrefixes: Record<TutorMode, string> = {
    ask_doubt: 'Answer the following JEE doubt with a clear, step-by-step explanation. Break down each step logically.',
    explain: 'Explain this JEE concept thoroughly. Start with the core idea, build intuition, then connect to related topics.',
    solve: 'Solve this numerical problem step by step. Show the formula, substitution, calculation, and final answer with units.',
    formula_revision: 'List the key formulas for this topic. Group them logically and add brief notes on when to use each.',
    quick_summary: 'Provide a concise, bullet-point summary of this topic. Cover definitions, key formulas, and important points.',
    quiz: 'Generate a JEE-level quiz question on this topic. Provide 4 options, the correct answer, and a brief explanation.',
    practice: 'Generate 3 practice questions on this topic at varying difficulty levels. Include full solutions.',
    error_analysis: 'Analyze common mistakes students make in this topic. Explain why each mistake occurs and how to avoid it.',
  }

  let contextStr = ''
  if (context?.subject) contextStr += `\nCurrent subject: ${context.subject}`
  if (context?.chapter) contextStr += `\nCurrent chapter: ${context.chapter}`
  if (context?.recentTopics?.length) contextStr += `\nRecently studied: ${context.recentTopics.join(', ')}`

  return `${modePrefixes[mode]}${contextStr}

Remember:
- Be concise but thorough
- Use proper mathematical notation
- Reference NCERT concepts where applicable
- Adapt to JEE Main/Advanced level
- Encourage conceptual understanding before formulas

Query: ${query}`
}
