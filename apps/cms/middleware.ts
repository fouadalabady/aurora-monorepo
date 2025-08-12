import { middlewareAuthHandler as auth } from "@workspace/auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define role-based access control
const roleBasedRoutes = {
  // Admin-only routes
  admin: [
    "/admin",
    "/users",
    "/settings",
    "/analytics"
  ],
  // Editor and above routes
  editor: [
    "/content",
    "/posts",
    "/pages",
    "/media"
  ],
  // Author and above routes
  author: [
    "/my-content",
    "/drafts"
  ],
  // All authenticated users
  authenticated: [
    "/dashboard",
    "/profile"
  ]
}

// Role hierarchy for access control
const roleHierarchy = {
  Admin: 4,
  Editor: 3,
  Author: 2,
  Viewer: 1
}

function hasAccess(userRole: string, requiredLevel: string): boolean {
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const required = roleHierarchy[requiredLevel as keyof typeof roleHierarchy] || 0
  return userLevel >= required
}

function getRequiredRole(pathname: string): string | null {
  // Check admin routes
  if (roleBasedRoutes.admin.some(route => pathname.startsWith(route))) {
    return "Admin"
  }
  
  // Check editor routes
  if (roleBasedRoutes.editor.some(route => pathname.startsWith(route))) {
    return "Editor"
  }
  
  // Check author routes
  if (roleBasedRoutes.author.some(route => pathname.startsWith(route))) {
    return "Author"
  }
  
  // Check authenticated routes
  if (roleBasedRoutes.authenticated.some(route => pathname.startsWith(route))) {
    return "Viewer"
  }
  
  return null
}

export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // Allow access to auth pages
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  
  // Check if route requires authentication
  const requiredRole = getRequiredRole(pathname)
  
  if (requiredRole) {
    // Redirect to signin if not authenticated
    if (!session) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    const userRole = session.user?.role as string
    
    // Check if user has required access level
    if (!hasAccess(userRole, requiredRole)) {
      // Redirect to access denied page or dashboard based on role
      const redirectUrl = new URL("/dashboard", req.url)
      redirectUrl.searchParams.set("error", "access_denied")
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return NextResponse.next()
})

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}