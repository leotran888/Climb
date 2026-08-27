import LogoutButton from '@/components/LogoutButton'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Tài khoản bị tạm khóa</h1>
        <p className="text-sm text-slate-500 mb-6">
          Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ admin để biết thêm thông tin.
        </p>
        <LogoutButton />
      </div>
    </div>
  )
}
