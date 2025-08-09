import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// This is the root layout required by Next.js App Router
// The locale-specific layout will handle the HTML structure
export default function RootLayout({ children }: Props) {
  return children;
}