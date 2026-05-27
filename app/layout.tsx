import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';  // 🛠️ Fixed: Native relative path works flawlessly now!
import { ClerkProvider } from '@clerk/nextjs';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import RealTimeQueueWatcher from '@/components/RealTimeQueueWatcher'; // Import our new client worker module

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FuelEase',
  description: 'Fuel booking system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-slate-50`}
      >
        <ClerkProvider>
          {/* Main Content Layout pages */}
          <main className='flex-1 w-full'>{children}</main>

          {/* 🔔 Live Client background listener with automated voice responses */}
          <RealTimeQueueWatcher />

          <Footer />

          <Toaster position='top-right' />
        </ClerkProvider>
      </body>
    </html>
  );
}