import 'server-only'
import { OpenAIStream, StreamingTextResponse } from 'ai'
// import { Configuration, OpenAIApi } from 'openai-edge'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // defaults to process.env["OPENAI_API_KEY"]
})

export const runtime = 'nodejs'

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY
// })

// const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
  const json = await req.json()
  const { messages } = json
  const userId = (await auth({ cookieStore }))?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const json_format = {
    answer: '',
    nextPossibleQuestions: [
      {
        question: ''
      },
      {
        question: ''
      },
      {
        question: ''
      }
    ]
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant designed to output JSON in this format ${JSON.stringify(
          json_format
        )}, nextPossibleQuestions is an array of some possible questions that user can ask.`
      },
      ...messages
    ],
    temperature: 0.7,
    stream: true,
    response_format: {
      type: 'json_object'
    }
  })

  // console.log(res)

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      // Insert chat into database.
      await supabase.from('chats').upsert({ id, payload }).throwOnError()
    }
  })

  // const stream = OpenAIStream(res)
  return new StreamingTextResponse(stream)
}
