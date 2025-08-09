import { redirect } from 'next/navigation';

// Root page that redirects to the default locale
// This handles the case when someone visits the root URL
export default function RootPage() {
  // Redirect to the default locale
  redirect('/en');
}