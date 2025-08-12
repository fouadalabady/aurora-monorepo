import { handlers } from '@workspace/auth'

// FLUX Rule: API routes require Node runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers