import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Next.js App Router + NextAuth + Tailwind CSS',
  description:
    'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.'
};

export default function RootLayout({
  children,
  breadcrumb
}: {
  children: React.ReactNode;
  breadcrumb: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
      <div className="left-[90px] top-[25px] absolute z-50">{breadcrumb}</div>
        {children}
      </body>
      <Analytics />
    </html>
  );
}
