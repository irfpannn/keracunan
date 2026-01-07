import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Keracunan Makanan',
  description: 'Panduan keselamatan makanan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
