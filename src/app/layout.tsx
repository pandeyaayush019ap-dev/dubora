import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dubora — AI-Powered Multilingual Video Dubbing SaaS Platform',
  description:
    'Professional video localization workspace combining AI dubbing, translation review, speaker management, audio synchronization, and finished-video export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-heather-950 text-feather antialiased selection:bg-duskyPink/30 selection:text-feather">
        {children}
      </body>
    </html>
  );
}
