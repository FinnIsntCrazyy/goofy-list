import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Goofy Levels List (GLL)',
  description: 'The official Custom Geometry Dash List about Goofy Levels!',
  icons: {
    icon: '/favicon.ico', // You can replace public/favicon.ico with your custom icon file!
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
