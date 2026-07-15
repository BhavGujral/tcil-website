import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TCIL - Telecommunications Consultants India Limited',
  description: 'A Government of India Enterprise providing world-class Telecom & IT services',
  keywords: 'TCIL, Telecom, IT Services, Government India, Tenders, Careers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}