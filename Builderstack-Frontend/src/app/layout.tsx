import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'BuilderStack - No-Code Adviser',
  description: 'Find your perfect no-code solution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white">
        <AuthProvider>
          <Navbar />
          <div className="flex h-[calc(100vh-64px)]">
            <Sidebar />
            <main className="flex-1 p-8">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}