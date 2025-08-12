import { Metadata } from "next"
import { auth } from "@workspace/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@workspace/ui"
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react"

// FLUX Rule: Fresh by default for admin interfaces
export const revalidate = 0

export const metadata: Metadata = {
  title: "Dashboard - Aurora CMS",
  description: "Aurora CMS Dashboard", 
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const user = session.user
  const userRole = user.role

  // Mock data - in real app, fetch from API
  const stats = {
    totalUsers: 156,
    totalPosts: 89,
    totalLeads: 234,
    conversionRate: "12.5%"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>Current user information and role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary">{userRole}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks based on your role: {userRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {userRole === "Admin" && (
              <>
                <p className="text-sm">• Manage users and permissions</p>
                <p className="text-sm">• View system analytics</p>
                <p className="text-sm">• Configure system settings</p>
              </>
            )}
            {(userRole === "Editor" || userRole === "Admin") && (
              <>
                <p className="text-sm">• Create and edit content</p>
                <p className="text-sm">• Manage media library</p>
                <p className="text-sm">• Review and publish posts</p>
              </>
            )}
            {(userRole === "Author" || userRole === "Editor" || userRole === "Admin") && (
              <>
                <p className="text-sm">• Write new articles</p>
                <p className="text-sm">• Manage your drafts</p>
              </>
            )}
            <p className="text-sm">• Update your profile</p>
            <p className="text-sm">• View dashboard analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}