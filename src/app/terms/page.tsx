import type { Metadata } from 'next'
import Link from 'next/link'
import ClimbLogo from '@/components/ClimbLogo'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ Climb IELTS. Vui lòng đọc kỹ trước khi sử dụng.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/"><ClimbLogo size="sm" /></Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">← Trang chủ</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Điều khoản sử dụng</h1>
        <p className="text-sm text-slate-400 mb-10">Cập nhật lần cuối: tháng 8 năm 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Chấp nhận điều khoản</h2>
            <p className="text-sm">Bằng cách tạo tài khoản hoặc sử dụng Climb IELTS, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Mô tả dịch vụ</h2>
            <p className="text-sm">Climb IELTS là nền tảng luyện thi IELTS sử dụng AI để chấm điểm và đưa ra phản hồi cho bài Writing và Speaking. Điểm số từ AI mang tính chất tham khảo và không thay thế cho điểm số chính thức từ IELTS.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Tài khoản người dùng</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
              <li>Mỗi người dùng chỉ được tạo một tài khoản.</li>
              <li>Không được chia sẻ tài khoản với người khác.</li>
              <li>Bạn phải đủ 13 tuổi trở lên để sử dụng dịch vụ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Gói và thanh toán</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Gói Free cung cấp số lượt sử dụng giới hạn miễn phí không giới hạn thời gian.</li>
              <li>Gói trả phí tính theo tháng hoặc năm như hiển thị tại trang <Link href="/subscription" className="text-emerald-600 hover:underline">Gói của tôi</Link>.</li>
              <li>Giá có thể thay đổi với thông báo trước 30 ngày.</li>
              <li>Lượt sử dụng không dùng hết trong tháng sẽ không được chuyển sang tháng tiếp theo.</li>
              <li>Hiện tại chúng tôi không hoàn tiền trừ trường hợp lỗi kỹ thuật nghiêm trọng từ phía chúng tôi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Nội dung người dùng</h2>
            <p className="text-sm">Bạn giữ toàn bộ quyền sở hữu với bài nộp của mình. Bằng cách nộp bài, bạn cho phép chúng tôi xử lý nội dung đó qua AI để tạo phản hồi. Chúng tôi không sử dụng bài nộp của bạn để huấn luyện mô hình AI.</p>
            <p className="mt-2 text-sm">Bạn không được nộp nội dung vi phạm pháp luật, xúc phạm, hoặc xâm phạm quyền sở hữu trí tuệ của bên thứ ba.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Giới hạn trách nhiệm</h2>
            <p className="text-sm">Climb IELTS cung cấp dịch vụ "như hiện có". Chúng tôi không đảm bảo điểm số AI phản ánh chính xác điểm thi IELTS thực tế. Chúng tôi không chịu trách nhiệm về kết quả thi của bạn dựa trên việc sử dụng dịch vụ này.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Chấm dứt dịch vụ</h2>
            <p className="text-sm">Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản vi phạm điều khoản này mà không cần thông báo trước. Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào bằng cách liên hệ chúng tôi.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Luật áp dụng</h2>
            <p className="text-sm">Các điều khoản này được điều chỉnh bởi pháp luật Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Liên hệ</h2>
            <p className="text-sm">Câu hỏi về điều khoản sử dụng: <a href="mailto:support@climbielts.com" className="text-emerald-600 hover:underline">support@climbielts.com</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 px-6 py-6 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <span>© 2025 Climb IELTS. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Bảo mật</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors font-medium text-slate-600">Điều khoản</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Trang chủ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
