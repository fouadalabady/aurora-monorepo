// Aurora Database Package
// Exports Prisma client and database utilities

export { PrismaClient } from './generated'
export type {
  User,
  Account,
  Session,
  Service,
  Lead,
  LeadActivity,
  Testimonial,
  Project,
  Post,
  Page,
  TeamMember,
  Setting,
  UserRole,
  ContentStatus,
  PriceType,
  LeadSource,
  LeadStatus,
  Priority,
  LeadActivityType,
} from './generated'

export { db } from './client'