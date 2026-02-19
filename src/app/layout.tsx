import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kosh eN - 越縁巡り部',
  description: '47Siteseeing: 聖地を巡り、徳を積む部活動',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}