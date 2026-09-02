import WritingCheckerForm from '@/components/WritingCheckerForm'

export default function WritingPage() {
  return (
    <div className="space-y-3 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          AI Writing Checker
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Check My Writing</h1>
        <p className="text-slate-500 mt-2 text-base">
          Paste any IELTS question and your essay — AI will score it on all 4 criteria, correct errors, and give detailed feedback.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-[20px] border border-[rgba(22,163,68,.13)] p-3 flex-1 flex flex-col">
        <WritingCheckerForm />
      </div>
    </div>
  )
}
