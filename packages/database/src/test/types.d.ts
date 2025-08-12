// Global test utilities type declarations

interface MockUser {
  id: string
  email: string
  name: string
  role: string
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockService {
  id: string
  title: string
  slug: string
  description: string
  content: string
  excerpt: string
  category: string
  price: number
  priceType: string
  features: string[]
  tags: string[]
  status: string
  published: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface MockLead {
  id: string
  name: string
  email: string
  phone: string
  company: string | null
  message: string
  source: string
  status: string
  priority: string
  estimatedValue: number | null
  serviceId: string | null
  assignedToId: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockTestimonial {
  id: string
  name: string
  company: string | null
  position: string | null
  content: string
  rating: number
  featured: boolean
  approved: boolean
  serviceId: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockProject {
  id: string
  title: string
  slug: string
  description: string
  content: string
  clientName: string
  location: string | null
  duration: string | null
  value: number | null
  status: string
  featured: boolean
  published: boolean
  publishedAt: Date | null
  completedAt: Date | null
  serviceId: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string | null
  tags: string[]
  status: string
  published: boolean
  publishedAt: Date | null
  authorId: string
  createdAt: Date
  updatedAt: Date
}

interface MockTeamMember {
  id: string
  name: string
  position: string
  bio: string | null
  specialties: string[]
  featured: boolean
  active: boolean
  order: number
  image: string | null
  createdAt: Date
  updatedAt: Date
}

interface MockSetting {
  id: string
  key: string
  value: string
  type: string
  category: string
  createdAt: Date
  updatedAt: Date
}

// Extend the global namespace
declare global {
  function createMockUser(overrides?: Partial<MockUser>): MockUser
  function createMockService(overrides?: Partial<MockService>): MockService
  function createMockLead(overrides?: Partial<MockLead>): MockLead
  function createMockTestimonial(overrides?: Partial<MockTestimonial>): MockTestimonial
  function createMockProject(overrides?: Partial<MockProject>): MockProject
  function createMockPost(overrides?: Partial<MockPost>): MockPost
  function createMockTeamMember(overrides?: Partial<MockTeamMember>): MockTeamMember
  function createMockSetting(overrides?: Partial<MockSetting>): MockSetting
}

export {}