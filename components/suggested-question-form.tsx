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
      className=""
      onSubmit={async e => {
        e.preventDefault()
        if (!ques.question?.trim()) {
          return
        }
        setInput('')
        await onSubmit(ques.question)
      }}
    >
      <button
        type="submit"
        className="w-full cursor-pointer rounded-md border border-emerald-200 bg-transparent px-4 py-2 text-sm text-emerald-500 hover:bg-emerald-100"
      >
        {ques.question}
      </button>
    </form>
  )
}
