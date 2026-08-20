import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-700 tracking-tight">CLIMB</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Log in
            </Link>
            <Link href="/register" className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          AI-Powered IELTS Practice
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Know your level.<br />
          <span className="text-blue-700">Climb higher.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Practice IELTS Writing with real exam conditions and get detailed AI feedback on all 4 scoring criteria — just like a real examiner.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200">
            Start Practicing Free
          </Link>
          <Link href="/login" className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
            Log In
          </Link>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          * Band scores are AI estimates — not official IELTS scores.
        </p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Everything you need to prepare
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⏱', title: 'Real Exam Conditions', desc: 'Timed tests with countdown timer and auto-submit. Word count displayed in real time.' },
              { icon: '🤖', title: 'AI Grading on 4 Criteria', desc: 'Scored on Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range.' },
              { icon: '📋', title: 'Specific Feedback', desc: 'AI pinpoints exact errors in your essay and shows you how to fix them.' },
              { icon: '📊', title: 'Track Your Progress', desc: 'See your band score trend over time and identify which areas need the most work.' },
              { icon: '📝', title: 'All Writing Task Types', desc: 'Academic Task 1, General Training Task 1, and Writing Task 2 — all covered.' },
              { icon: '👩‍🏫', title: 'Teacher Review', desc: 'Teachers can review AI feedback, listen to Speaking, and add their own score.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to start climbing?</h2>
          <p className="text-slate-500 mb-8">Create a free account and complete your first writing test in minutes.</p>
          <Link href="/register" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p>© 2025 CLIMB. AI-estimated band scores are not official IELTS results.</p>
      </footer>
    </div>
  )
}
