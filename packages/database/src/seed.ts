import { db } from './client'
import type { UserRole } from './generated'

// Seed data for development
export async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create admin user
    const adminUser = await db.user.upsert({
      where: { email: 'admin@aurora.dev' },
      update: {},
      create: {
        email: 'admin@aurora.dev',
        name: 'Aurora Admin',
        role: 'ADMIN' as UserRole,
        emailVerified: new Date(),
      },
    })

    console.log('✅ Admin user created')

    // Create services
    const services = [
      {
        title: 'HVAC Installation',
        slug: 'hvac-installation',
        description: 'Professional HVAC system installation for residential and commercial properties',
        content: 'Complete HVAC installation services including system design, equipment selection, and professional installation by certified technicians.',
        excerpt: 'Professional HVAC installation services',
        category: 'Installation',
        price: 5000,
        priceType: 'STARTING_FROM' as const,
        features: ['Free consultation', 'Energy-efficient systems', '5-year warranty', '24/7 support'],
        tags: ['hvac', 'installation', 'air-conditioning', 'heating'],
        status: 'PUBLISHED' as const,
        published: true,
        publishedAt: new Date(),
      },
      {
        title: 'AC Repair & Maintenance',
        slug: 'ac-repair-maintenance',
        description: 'Expert air conditioning repair and maintenance services',
        content: 'Keep your AC running efficiently with our comprehensive repair and maintenance services.',
        excerpt: 'Expert AC repair and maintenance',
        category: 'Maintenance',
        price: 150,
        priceType: 'STARTING_FROM' as const,
        features: ['Same-day service', 'Licensed technicians', '90-day warranty', 'Emergency repairs'],
        tags: ['ac', 'repair', 'maintenance', 'emergency'],
        status: 'PUBLISHED' as const,
        published: true,
        publishedAt: new Date(),
      },
      {
        title: 'Commercial HVAC Solutions',
        slug: 'commercial-hvac-solutions',
        description: 'Comprehensive HVAC solutions for commercial buildings',
        content: 'Specialized commercial HVAC services including design, installation, and maintenance for office buildings, retail spaces, and industrial facilities.',
        excerpt: 'Commercial HVAC solutions',
        category: 'Commercial',
        price: 10000,
        priceType: 'QUOTE_REQUIRED' as const,
        features: ['Custom design', 'Energy audits', 'Preventive maintenance', 'Emergency service'],
        tags: ['commercial', 'hvac', 'office', 'industrial'],
        status: 'PUBLISHED' as const,
        published: true,
        publishedAt: new Date(),
      },
    ]

    for (const service of services) {
      await db.service.upsert({
        where: { slug: service.slug },
        update: service,
        create: service,
      })
    }

    console.log('✅ Services created')

    // Create testimonials
    const testimonials = [
      {
        name: 'Sarah Johnson',
        company: 'Johnson Enterprises',
        position: 'Facility Manager',
        content: 'Aurora provided exceptional HVAC installation service. Their team was professional, efficient, and the system works perfectly. Highly recommended!',
        rating: 5,
        featured: true,
        approved: true,
      },
      {
        name: 'Mike Chen',
        company: 'Tech Solutions Inc.',
        position: 'Operations Director',
        content: 'Quick response time and excellent repair service. Our office AC was fixed within hours of calling. Great customer service!',
        rating: 5,
        featured: true,
        approved: true,
      },
      {
        name: 'Lisa Rodriguez',
        company: 'Green Valley Mall',
        position: 'Property Manager',
        content: 'Aurora handles all our commercial HVAC needs. Their preventive maintenance program has saved us thousands in emergency repairs.',
        rating: 5,
        featured: false,
        approved: true,
      },
    ]

    for (const testimonial of testimonials) {
      await db.testimonial.create({
        data: testimonial,
      })
    }

    console.log('✅ Testimonials created')

    // Create team members
    const teamMembers = [
      {
        name: 'John Smith',
        position: 'Lead HVAC Technician',
        bio: 'John has over 15 years of experience in HVAC installation and repair. He holds multiple certifications and leads our technical team.',
        specialties: ['HVAC Installation', 'System Design', 'Energy Efficiency'],
        featured: true,
        active: true,
        order: 1,
      },
      {
        name: 'Maria Garcia',
        position: 'Commercial HVAC Specialist',
        bio: 'Maria specializes in large commercial HVAC systems and has worked on projects for major office buildings and retail centers.',
        specialties: ['Commercial Systems', 'Project Management', 'Energy Audits'],
        featured: true,
        active: true,
        order: 2,
      },
      {
        name: 'David Wilson',
        position: 'Service Technician',
        bio: 'David provides reliable repair and maintenance services with a focus on customer satisfaction and quick problem resolution.',
        specialties: ['AC Repair', 'Preventive Maintenance', 'Emergency Service'],
        featured: false,
        active: true,
        order: 3,
      },
    ]

    for (const member of teamMembers) {
      await db.teamMember.create({
        data: member,
      })
    }

    console.log('✅ Team members created')

    // Create sample projects
    const projects = [
      {
        title: 'Downtown Office Building HVAC Upgrade',
        slug: 'downtown-office-hvac-upgrade',
        description: 'Complete HVAC system upgrade for a 10-story office building',
        content: 'This project involved replacing an outdated HVAC system with a modern, energy-efficient solution that reduced energy costs by 30%.',
        clientName: 'Metro Properties',
        location: 'Downtown Business District',
        duration: '6 weeks',
        value: 150000,
        status: 'PUBLISHED' as const,
        featured: true,
        published: true,
        publishedAt: new Date(),
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        title: 'Residential AC Installation',
        slug: 'residential-ac-installation',
        description: 'High-efficiency AC system installation for luxury home',
        content: 'Installation of a premium central air conditioning system with smart thermostat integration and zone control.',
        clientName: 'Private Residence',
        location: 'Suburban Area',
        duration: '2 days',
        value: 8500,
        status: 'PUBLISHED' as const,
        featured: false,
        published: true,
        publishedAt: new Date(),
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    ]

    for (const project of projects) {
      await db.project.create({
        data: project,
      })
    }

    console.log('✅ Projects created')

    // Create sample blog posts
    const posts = [
      {
        title: '5 Signs Your HVAC System Needs Repair',
        slug: '5-signs-hvac-system-needs-repair',
        content: 'Learn to identify the warning signs that indicate your HVAC system requires professional attention...',
        excerpt: 'Identify warning signs that your HVAC system needs professional repair',
        category: 'Maintenance Tips',
        tags: ['hvac', 'maintenance', 'repair', 'tips'],
        status: 'PUBLISHED' as const,
        published: true,
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
      {
        title: 'Energy-Efficient HVAC Solutions for Your Home',
        slug: 'energy-efficient-hvac-solutions',
        content: 'Discover how modern HVAC systems can reduce your energy bills while improving comfort...',
        excerpt: 'Modern HVAC solutions that save energy and money',
        category: 'Energy Efficiency',
        tags: ['energy-efficiency', 'hvac', 'savings', 'environment'],
        status: 'PUBLISHED' as const,
        published: true,
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
    ]

    for (const post of posts) {
      await db.post.create({
        data: post,
      })
    }

    console.log('✅ Blog posts created')

    // Create essential settings
    const settings = [
      { key: 'site_title', value: 'Aurora HVAC Services', category: 'general' },
      { key: 'site_description', value: 'Professional HVAC installation, repair, and maintenance services', category: 'general' },
      { key: 'contact_email', value: 'info@aurora-hvac.com', category: 'contact' },
      { key: 'contact_phone', value: '+1 (555) 123-4567', category: 'contact' },
      { key: 'business_hours', value: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM', category: 'contact' },
      { key: 'emergency_phone', value: '+1 (555) 911-HVAC', category: 'contact' },
      { key: 'service_areas', value: 'Metro Area, Suburbs, Commercial District', category: 'business' },
      { key: 'google_recaptcha_site_key', value: '', category: 'security' },
      { key: 'plausible_domain', value: 'aurora-hvac.com', category: 'analytics' },
    ]

    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, category: setting.category },
        create: setting,
      })
    }

    console.log('✅ Settings created')

    // Create sample leads
    const leads = [
      {
        name: 'Jennifer Adams',
        email: 'jennifer.adams@email.com',
        phone: '+1 (555) 234-5678',
        company: 'Adams Consulting',
        message: 'Need HVAC installation for new office space. Looking for energy-efficient solutions.',
        source: 'WEBSITE' as const,
        status: 'NEW' as const,
        priority: 'HIGH' as const,
        estimatedValue: 25000,
      },
      {
        name: 'Robert Kim',
        email: 'robert.kim@email.com',
        phone: '+1 (555) 345-6789',
        message: 'AC not cooling properly. Need emergency repair service.',
        source: 'PHONE' as const,
        status: 'CONTACTED' as const,
        priority: 'URGENT' as const,
        estimatedValue: 500,
      },
    ]

    for (const lead of leads) {
      await db.lead.create({
        data: lead,
      })
    }

    console.log('✅ Sample leads created')

    console.log('🎉 Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await db.$disconnect()
    })
}