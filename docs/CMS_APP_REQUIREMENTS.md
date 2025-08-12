# CMS App Requirements

## Purpose
Admin CMS to manage **content** and **leads** in Postgres via API (REST + GraphQL) with fast, uncached views.

## Auth & Roles
| Role | Can Do |
|---|---|
| Admin | Full CRUD, users, settings |
| Editor | Content CRUD, lead view/update |
| Agent | Work leads only |
| Viewer | Read-only |

## Modules (no analytics)
- **Dashboard**: recent leads, quick actions (no cached widgets)
- **Leads**: Kanban/table, details, notes, assignment
- **Content**: services, posts, pages, media
- **Users**: team & roles
- **Settings**: business profile, CTAs, WhatsApp number

## Freshness Controls
- In all server components: `export const revalidate = 0` or call `unstable_noStore()`.
- Client fetches to API use `{ cache: 'no-store' }`.

## UI Rules
- **Never hand‑code shadcn** components.
- Add via: `pnpm dlx shadcn-ui@latest add button input textarea table dialog sheet form`.
- All custom UI lives in `packages/ui` and is consumed via `@workspace/ui`.

## Example Lead List (server component)
```tsx
export const revalidate = 0
import { DataTable } from '@workspace/ui'
import { api } from '@workspace/core/api-client' // wraps REST or GraphQL

export default async function LeadsPage() {
  const leads = await api.leads.list({ cache: 'no-store' })
  return <DataTable data={leads} columns={[/* ... */]} />
}
```
