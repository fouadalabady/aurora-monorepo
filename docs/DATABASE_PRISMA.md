# Database (Prisma + PostgreSQL)

## Schema (core excerpt)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(VIEWER)
  password  String
  leads     Lead[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Lead {
  id        String   @id @default(cuid())
  name      String
  email     String?
  phone     String?
  message   String?
  source    LeadSource @default(website)
  status    LeadStatus @default(NEW)
  priority  Priority   @default(NORMAL)
  service   Service?   @relation(fields: [serviceId], references: [id])
  serviceId String?
  assignee  User?      @relation(fields: [assigneeId], references: [id])
  assigneeId String?
  createdAt DateTime @default(now())
}

model Service {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String?
  featured  Boolean  @default(false)
  status    ContentStatus @default(DRAFT)
  leads     Lead[]
}

enum LeadStatus { NEW CONTACTED QUALIFIED WON LOST }
enum Priority { LOW NORMAL HIGH }
enum ContentStatus { DRAFT PUBLISHED ARCHIVED }
enum LeadSource { website phone referral }
```

## Migrations & Seeding
```bash
pnpm prisma migrate dev
pnpm prisma db seed
pnpm prisma generate
```

## Patterns
- Use **transactions** for multi‑write mutations.
- Avoid N+1 in GraphQL: use **prisma.dataloader** pattern or batched queries.
