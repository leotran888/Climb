import type { Metadata } from 'next'
import Link from 'next/link'
import ClimbLogo from '@/components/ClimbLogo'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật và quyền riêng tư của Climb IELTS. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><ClimbLogo size="sm" /></Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">← Trang chủ</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Chính sách bảo mật</h1>
        <p className="text-sm text-slate-400 mb-10">Cập nhật lần cuối: tháng 8 năm 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Thông tin chúng tôi thu thập</h2>
            <p>Khi bạn sử dụng Climb IELTS, chúng tôi thu thập:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li><strong>Thông tin tài khoản:</strong> họ tên, địa chỉ email, mật khẩu (được mã hóa).</li>
              <li><strong>Nội dung bài nộp:</strong> bài luận Writing, câu trả lời Speaking bạn tải lên để chấm điểm.</li>
              <li><strong>Dữ liệu sử dụng:</strong> lịch sử bài nộp, điểm số, lượt sử dụng tính năng, tiến độ học tập.</li>
              <li><strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, thời gian truy cập — dùng để vận hành và bảo mật dịch vụ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Cách chúng tôi sử dụng thông tin</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Cung cấp và cải thiện tính năng chấm bài bằng AI.</li>
              <li>Lưu lịch sử và theo dõi tiến độ học của bạn.</li>
              <li>Gửi thông báo liên quan đến tài khoản (xác nhận email, đặt lại mật khẩu).</li>
              <li>Phát hiện và ngăn chặn hành vi gian lận, lạm dụng hệ thống.</li>
              <li>Phân tích tổng hợp (ẩn danh) để cải thiện chất lượng dịch vụ.</li>
            </ul>
            <p className="mt-3 text-sm">Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Chia sẻ thông tin với bên thứ ba</h2>
            <p className="text-sm">Chúng tôi chỉ chia sẻ thông tin với các nhà cung cấp dịch vụ cần thiết để vận hành Climb IELTS:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li><strong>Supabase</strong> — lưu trữ cơ sở dữ liệu và xác thực tài khoản.</li>
              <li><strong>Anthropic (Claude AI)</strong> — xử lý và chấm điểm bài nộp.</li>
              <li><strong>Vercel</strong> — hosting và vận hành ứng dụng.</li>
            </ul>
            <p className="mt-3 text-sm">Các bên này được ràng buộc bởi chính sách bảo mật của riêng họ và không được phép sử dụng thông tin của bạn ngoài phạm vi cung cấp dịch vụ.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Bảo mật dữ liệu</h2>
            <p className="text-sm">Dữ liệu được mã hóa trong quá trình truyền tải (HTTPS/TLS). Mật khẩu được lưu ở dạng hash — chúng tôi không bao giờ lưu mật khẩu dạng thô. Quyền truy cập vào cơ sở dữ liệu được kiểm soát chặt chẽ theo nguyên tắc tối thiểu đặc quyền.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Quyền của bạn</h2>
            <p className="text-sm">Bạn có quyền:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Truy cập và tải xuống dữ liệu cá nhân của mình.</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác.</li>
              <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
              <li>Từ chối nhận email tiếp thị (nếu có).</li>
            </ul>
            <p className="mt-3 text-sm">Để thực hiện các quyền này, liên hệ: <a href="mailto:support@climbielts.com" className="text-emerald-600 hover:underline">support@climbielts.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Cookies</h2>
            <p className="text-sm">Climb IELTS sử dụng cookie phiên làm việc (session cookie) để duy trì trạng thái đăng nhập. Chúng tôi không sử dụng cookie theo dõi quảng cáo hoặc cookie của bên thứ ba để phân tích hành vi.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Thay đổi chính sách</h2>
            <p className="text-sm">Chúng tôi có thể cập nhật chính sách này theo thời gian. Thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trong ứng dụng. Ngày cập nhật luôn được hiển thị ở đầu trang.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Liên hệ</h2>
            <p className="text-sm">Mọi câu hỏi về quyền riêng tư, liên hệ chúng tôi qua:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Email: <a href="mailto:support@climbielts.com" className="text-emerald-600 hover:underline">support@climbielts.com</a></li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 px-6 py-6 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span>© 2025 Climb IELTS. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors font-medium text-slate-600">Bảo mật</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Điều khoản</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
