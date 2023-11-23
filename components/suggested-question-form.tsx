import { UseChatHelpers } from 'ai/react/dist'

export interface ChatMessageProps extends Pick<UseChatHelpers, 'setInput'> {
  setInput: UseChatHelpers['setInput']
  id?: string
  ques: any
  onSubmit: (value: string) => Promise<void>
}

export default function SuggestedQuestionForm({
  ques,
  setInput,
  onSubmit
}: ChatMessageProps) {
  return (
    <form
      className="cursor-pointer rounded-md bg-white px-4 py-2 text-gray-600 hover:text-gray-800"
      onClick={() => setInput(ques.question)}
      onSubmit={async e => {
        e.preventDefault()
        if (!ques.question?.trim()) {
          return
        }
        setInput('')
        await onSubmit(ques.question)
      }}
    >
      <button type="submit" className="text-left">
        {ques.question}
      </button>
    </form>
  )
}
