import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.climbielts.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Climb IELTS — Luyện Writing & Speaking với AI',
    template: '%s | Climb IELTS',
  },
  description: 'AI viết lại bài của bạn đạt Band mục tiêu — không chỉ chỉ lỗi. Kho từ vựng 18 topic IELTS Writing, hiểu đúng lỗi đặc thù học viên Việt. Thử miễn phí.',
  keywords: ['IELTS', 'luyện IELTS', 'chấm bài IELTS', 'IELTS Writing', 'IELTS Speaking', 'AI IELTS', 'tăng band IELTS'],
  authors: [{ name: 'Climb IELTS' }],
  creator: 'Climb IELTS',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'Climb IELTS',
    title: 'Climb IELTS — Luyện Writing & Speaking với AI',
    description: 'AI viết lại bài đạt Band mục tiêu · Kho từ vựng 18 topic IELTS · Hiểu lỗi người Việt. Thử miễn phí.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Climb IELTS — Luyện Writing & Speaking với AI',
    description: 'AI viết lại bài đạt Band mục tiêu · Kho từ vựng 18 topic · Hiểu lỗi người Việt. Miễn phí.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${BASE_URL}/#organization`,
                  name: 'Climb IELTS',
                  url: BASE_URL,
                  logo: { '@type': 'ImageObject', url: `${BASE_URL}/og-image.png` },
                  contactPoint: { '@type': 'ContactPoint', email: 'support@climbielts.com', contactType: 'customer support' },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: 'Climb IELTS',
                  description: 'Nền tảng luyện thi IELTS Writing & Speaking với AI',
                  publisher: { '@id': `${BASE_URL}/#organization` },
                  inLanguage: 'vi-VN',
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
