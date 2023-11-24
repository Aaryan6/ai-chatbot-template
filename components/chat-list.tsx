import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { UseChatHelpers } from 'ai/react/dist'

export interface ChatList extends Pick<UseChatHelpers, 'append' | 'setInput'> {
  messages: Message[]
  setInput: UseChatHelpers['setInput']
  id?: string
}

export function ChatList({ messages, setInput, id, append }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } flex`}
        >
          <ChatMessage
            message={message}
            setInput={setInput}
            append={append}
            id={id}
            index={index}
            messagesLength={messages.length}
          />
          {/* {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )} */}
        </div>
      ))}
    </div>
  )
}
