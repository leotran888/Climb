import type { Metadata } from 'next'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.climbielts.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Climb IELTS — Luyện IELTS Writing Toàn Diện, Tăng Band Mục Tiêu',
    template: '%s | Climb IELTS',
  },
  description: 'Mọi thứ bạn cần để tự luyện IELTS Writing nghiêm túc: chấm bài đủ 4 tiêu chí, bài mẫu theo band mục tiêu, từ vựng 18 topic và kiến thức Writing — trong một nền tảng.',
  keywords: ['IELTS', 'luyện IELTS', 'chấm bài IELTS', 'IELTS Writing', 'AI IELTS', 'tăng band IELTS'],
  authors: [{ name: 'Climb IELTS' }],
  creator: 'Climb IELTS',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'Climb IELTS',
    title: 'Climb IELTS — Luyện IELTS Writing Toàn Diện, Tăng Band Mục Tiêu',
    description: 'Mọi thứ bạn cần để tự luyện IELTS Writing nghiêm túc: chấm bài đủ 4 tiêu chí, bài mẫu theo band mục tiêu, từ vựng 18 topic và kiến thức Writing — trong một nền tảng.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Climb IELTS — Luyện IELTS Writing Toàn Diện, Tăng Band Mục Tiêu',
    description: 'Mọi thứ bạn cần để tự luyện IELTS Writing nghiêm túc: chấm bài đủ 4 tiêu chí, bài mẫu theo band mục tiêu, từ vựng 18 topic và kiến thức Writing — trong một nền tảng.',
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
                  description: 'Nền tảng luyện thi IELTS Writing với AI',
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
