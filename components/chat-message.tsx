import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { UseChatHelpers } from 'ai/react/dist'
import SuggestedQuestionForm from './suggested-question-form'

export interface ChatMessageProps
  extends Pick<UseChatHelpers, 'append' | 'setInput'> {
  message: Message
  setInput: UseChatHelpers['setInput']
  id?: string
}

export function ChatMessage({
  message,
  setInput,
  id,
  append,
  ...props
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        `${
          message.role === 'user' && 'flex-row-reverse'
        } group relative my-4 flex max-w-xl items-start md:-ml-12`
      )}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
      </div>
      <div
        className={`${
          message.role === 'user'
            ? 'mr-4 rounded-tr-none'
            : 'ml-4 rounded-tl-none'
        } flex-1 space-y-2 overflow-hidden`}
      >
        <MemoizedReactMarkdown
          className="prose break-words rounded-md bg-white p-4 text-gray-800 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {message.role === 'user'
            ? message.content
            : (() => {
                try {
                  const parsedContent = JSON.parse(
                    message.content
                      .replace(/\\n/g, '\\\\n')
                      .replace(/\\'/g, "\\'")
                  )
                  return parsedContent.answer ?? message.content
                } catch (error) {
                  console.error('Error parsing JSON:', error)
                  return message.content
                }
              })()}
        </MemoizedReactMarkdown>
        {message.role === 'user'
          ? null
          : (() => {
              try {
                const parsedContent = JSON.parse(
                  message.content
                    .replace(/\\n/g, '\\\\n')
                    .replace(/\\'/g, "\\'")
                )
                return parsedContent.nextPossibleQuestions?.map(
                  (ques: { question: string }, i: number) => (
                    <SuggestedQuestionForm
                      ques={ques}
                      key={i}
                      setInput={setInput}
                      onSubmit={async value => {
                        await append({
                          id,
                          content: value,
                          role: 'user'
                        })
                      }}
                    />
                  )
                )
              } catch (error) {
                console.error('Error parsing JSON:', error)
              }
            })() ?? message.content}
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
