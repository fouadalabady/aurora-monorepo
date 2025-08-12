# API App Requirements

## Purpose
Unified BFF exposing **REST** and **GraphQL** for both apps over a single Prisma/Postgres source of truth.

## Routes & Conventions
- **REST base**: `/api/*` Route Handlers.
- **GraphQL endpoint**: `/api/graphql` (POST only). Node runtime. No GET caching.
- **Auth**: NextAuth JWT (bearer for API), role checks via middleware.

## REST Endpoints (core)
| Area | Endpoint | Method | Notes |
|---|---|---|---|
| Leads | `/api/leads/capture` | POST | Public, CAPTCHA, `no-store` |
| Leads | `/api/leads` | GET | Auth required, filter/sort/paginate |
| Leads | `/api/leads/:id` | GET/PUT | Assign, status updates |
| Content | `/api/content/services` | CRUD | Admin only |
| Content | `/api/content/posts` | CRUD | Admin only |
| Revalidate | `/api/revalidate/tag` | POST | `{ tag: 'content:posts' }` |

## GraphQL (excerpt)
```graphql
# schema.graphql
scalar DateTime

type Lead {
  id: ID!
  name: String!
  email: String
  phone: String
  message: String
  status: LeadStatus!
  createdAt: DateTime!
}

enum LeadStatus { NEW CONTACTED QUALIFIED WON LOST }

type Query {
  leads(status: LeadStatus, search: String, skip: Int, take: Int): [Lead!]!
}

type Mutation {
  createLead(name: String!, email: String, phone: String, message: String): Lead!
  updateLead(id: ID!, status: LeadStatus, assigneeId: ID): Lead!
  revalidate(tag: String!): Boolean!
}
```

### GraphQL Server (route handler)
```ts
// apps/api/app/api/graphql/route.ts
export const runtime = 'node' // prisma needs Node
export const dynamic = 'force-dynamic'

import { createYoga, createSchema } from 'graphql-yoga'
import type { NextRequest } from 'next/server'
import { prisma } from '@workspace/database'
import { revalidateTag } from 'next/cache'

const schema = createSchema({ /* typeDefs & resolvers (see below) */ })
const yoga = createYoga<NextRequest>({ schema, graphqlEndpoint: '/api/graphql', maskedErrors: true })

export async function POST(request: NextRequest) {
  // Ensure fresh processing
  return yoga.handleRequest(request, { headers: { 'Cache-Control': 'no-store' } })
}
```

### Resolver Pattern (Prisma in core)
```ts
// packages/core/src/lead.ts
export async function listLeads(prisma, args) { /* prisma.lead.findMany */ }
export async function createLead(prisma, input) { /* prisma.lead.create */ }

// apps/api/.../resolvers.ts
export const resolvers = {
  Query: { leads: (_r, a) => listLeads(prisma, a) },
  Mutation: {
    createLead: async (_r, input) => {
      const lead = await createLead(prisma, input)
      await fetch(process.env.WEB_REVALIDATE_URL!, { method: 'POST', body: JSON.stringify({ tag: 'content:leads' }) })
      return lead
    },
    revalidate: async (_r, { tag }) => { revalidateTag(tag); return true }
  }
}
```

## Error Shape
```ts
interface APIError { code: string; message: string; details?: Record<string, unknown>; }
```

## Security & Freshness
- `Cache-Control: no-store` on API responses by default.
- AuthZ middleware per route/resolver, rate limiting for public capture.
