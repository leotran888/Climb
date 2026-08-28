import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { term, sentence, definition } = await request.json()
  if (!sentence?.trim()) return NextResponse.json({ error: 'Sentence required' }, { status: 400 })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `You are an IELTS Writing tutor. A student is practising using the word/phrase "${term}" (definition: ${definition}).

Their sentence: "${sentence}"

Give brief feedback (3-4 sentences max) covering:
1. Whether the word is used correctly and naturally
2. Grammar accuracy
3. Academic appropriateness for IELTS Writing
4. A quick improvement suggestion if needed

Be encouraging but honest. Respond in English.`,
    }],
  })

  const feedback = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return NextResponse.json({ feedback })
}
