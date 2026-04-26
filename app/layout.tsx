import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const viewport = {
  themeColor: '#0F0F11',
};

export const metadata: Metadata = {
  title: 'Calculadora de Feira',
  description: 'Calculadora profissional para feiras.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Calc Feira',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
