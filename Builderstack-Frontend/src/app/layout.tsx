import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  title: 'BuilderStack - No-Code Adviser',
  description: 'Find your perfect no-code solution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: '100vh', background: 'var(--bone)', color: 'var(--ink)' }}>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
