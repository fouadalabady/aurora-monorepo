import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// This is the root layout required by Next.js App Router
// It provides the basic HTML structure
export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}