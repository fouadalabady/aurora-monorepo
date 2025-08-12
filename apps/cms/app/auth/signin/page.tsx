import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@workspace/auth"
import { SignInForm } from "../components/signin-form"

// FLUX Rule: Fresh by default for admin interfaces
export const revalidate = 0

export const metadata: Metadata = {
  title: "Sign In - Aurora CMS",
  description: "Sign in to Aurora CMS",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  
  // Redirect if already authenticated
  if (session) {
    redirect(params.callbackUrl || "/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Aurora CMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your content management system
          </p>
        </div>
        <SignInForm 
          callbackUrl={params.callbackUrl}
          error={params.error}
        />
      </div>
    </div>
  )
}