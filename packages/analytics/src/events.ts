import { getAnalyticsClient, trackIfAllowed } from './client'
import { z } from 'zod'

// Event schemas for type safety
const baseEventSchema = z.object({
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  revenue: z.object({
    currency: z.string(),
    amount: z.number(),
  }).optional(),
})

const leadEventSchema = baseEventSchema.extend({
  leadSource: z.string().optional(),
  serviceType: z.string().optional(),
  leadValue: z.number().optional(),
})

const serviceEventSchema = baseEventSchema.extend({
  serviceId: z.string(),
  serviceName: z.string(),
  serviceCategory: z.string().optional(),
  priceType: z.enum(['FIXED', 'HOURLY', 'QUOTE']).optional(),
})

const projectEventSchema = baseEventSchema.extend({
  projectId: z.string(),
  projectType: z.string().optional(),
  projectValue: z.number().optional(),
})

export type LeadEvent = z.infer<typeof leadEventSchema>
export type ServiceEvent = z.infer<typeof serviceEventSchema>
export type ProjectEvent = z.infer<typeof projectEventSchema>

// Core tracking functions
export const trackPageView = trackIfAllowed((url?: string, options?: { props?: Record<string, any> }) => {
  const client = getAnalyticsClient()
  client.trackPageview({
    url,
    ...options,
  })
})

export const trackEvent = trackIfAllowed((eventName: string, options?: { props?: Record<string, any>; revenue?: { currency: string; amount: number } }) => {
  const client = getAnalyticsClient()
  client.trackEvent(eventName, options)
})

// Business-specific tracking functions

// Lead tracking
export const trackLeadGenerated = trackIfAllowed((data: LeadEvent) => {
  const validated = leadEventSchema.parse(data)
  trackEvent('Lead Generated', {
    props: {
      leadSource: validated.leadSource,
      serviceType: validated.serviceType,
      leadValue: validated.leadValue,
      ...validated.props,
    },
    revenue: validated.revenue,
  })
})

export const trackLeadConverted = trackIfAllowed((data: LeadEvent) => {
  const validated = leadEventSchema.parse(data)
  trackEvent('Lead Converted', {
    props: {
      leadSource: validated.leadSource,
      serviceType: validated.serviceType,
      leadValue: validated.leadValue,
      ...validated.props,
    },
    revenue: validated.revenue,
  })
})

export const trackQuoteRequested = trackIfAllowed((data: ServiceEvent) => {
  const validated = serviceEventSchema.parse(data)
  trackEvent('Quote Requested', {
    props: {
      serviceId: validated.serviceId,
      serviceName: validated.serviceName,
      serviceCategory: validated.serviceCategory,
      priceType: validated.priceType,
      ...validated.props,
    },
  })
})

// Service tracking
export const trackServiceViewed = trackIfAllowed((data: ServiceEvent) => {
  const validated = serviceEventSchema.parse(data)
  trackEvent('Service Viewed', {
    props: {
      serviceId: validated.serviceId,
      serviceName: validated.serviceName,
      serviceCategory: validated.serviceCategory,
      ...validated.props,
    },
  })
})

export const trackServiceInquiry = trackIfAllowed((data: ServiceEvent) => {
  const validated = serviceEventSchema.parse(data)
  trackEvent('Service Inquiry', {
    props: {
      serviceId: validated.serviceId,
      serviceName: validated.serviceName,
      serviceCategory: validated.serviceCategory,
      ...validated.props,
    },
  })
})

// Contact tracking
export const trackContactFormSubmitted = trackIfAllowed((data?: { formType?: string; source?: string; props?: Record<string, any> }) => {
  trackEvent('Contact Form Submitted', {
    props: {
      formType: data?.formType || 'general',
      source: data?.source,
      ...data?.props,
    },
  })
})

export const trackPhoneCallInitiated = trackIfAllowed((data?: { source?: string; props?: Record<string, any> }) => {
  trackEvent('Phone Call Initiated', {
    props: {
      source: data?.source,
      ...data?.props,
    },
  })
})

export const trackEmailSent = trackIfAllowed((data?: { emailType?: string; recipient?: string; props?: Record<string, any> }) => {
  trackEvent('Email Sent', {
    props: {
      emailType: data?.emailType,
      recipient: data?.recipient,
      ...data?.props,
    },
  })
})

// Project tracking
export const trackProjectViewed = trackIfAllowed((data: ProjectEvent) => {
  const validated = projectEventSchema.parse(data)
  trackEvent('Project Viewed', {
    props: {
      projectId: validated.projectId,
      projectType: validated.projectType,
      ...validated.props,
    },
  })
})

export const trackProjectCompleted = trackIfAllowed((data: ProjectEvent) => {
  const validated = projectEventSchema.parse(data)
  trackEvent('Project Completed', {
    props: {
      projectId: validated.projectId,
      projectType: validated.projectType,
      projectValue: validated.projectValue,
      ...validated.props,
    },
    revenue: validated.revenue,
  })
})

// Content tracking
export const trackBlogPostViewed = trackIfAllowed((data: { postId: string; postTitle: string; category?: string; props?: Record<string, any> }) => {
  trackEvent('Blog Post Viewed', {
    props: {
      postId: data.postId,
      postTitle: data.postTitle,
      category: data.category,
      ...data.props,
    },
  })
})

export const trackTestimonialViewed = trackIfAllowed((data: { testimonialId: string; rating?: number; props?: Record<string, any> }) => {
  trackEvent('Testimonial Viewed', {
    props: {
      testimonialId: data.testimonialId,
      rating: data.rating,
      ...data.props,
    },
  })
})

// Search tracking
export const trackSearchPerformed = trackIfAllowed((data: { query: string; resultsCount: number; searchType?: string; props?: Record<string, any> }) => {
  trackEvent('Search Performed', {
    props: {
      query: data.query,
      resultsCount: data.resultsCount,
      searchType: data.searchType || 'global',
      ...data.props,
    },
  })
})

// User engagement tracking
export const trackNewsletterSignup = trackIfAllowed((data?: { source?: string; props?: Record<string, any> }) => {
  trackEvent('Newsletter Signup', {
    props: {
      source: data?.source,
      ...data?.props,
    },
  })
})

export const trackSocialShare = trackIfAllowed((data: { platform: string; contentType: string; contentId: string; props?: Record<string, any> }) => {
  trackEvent('Social Share', {
    props: {
      platform: data.platform,
      contentType: data.contentType,
      contentId: data.contentId,
      ...data.props,
    },
  })
})

export const trackFileDownload = trackIfAllowed((data: { fileName: string; fileType: string; source?: string; props?: Record<string, any> }) => {
  trackEvent('File Download', {
    props: {
      fileName: data.fileName,
      fileType: data.fileType,
      source: data.source,
      ...data.props,
    },
  })
})

// Error tracking
export const trackError = trackIfAllowed((data: { errorType: string; errorMessage: string; page?: string; props?: Record<string, any> }) => {
  trackEvent('Error Occurred', {
    props: {
      errorType: data.errorType,
      errorMessage: data.errorMessage,
      page: data.page,
      ...data.props,
    },
  })
})

// Performance tracking
export const trackPerformance = trackIfAllowed((data: { metric: string; value: number; page?: string; props?: Record<string, any> }) => {
  trackEvent('Performance Metric', {
    props: {
      metric: data.metric,
      value: data.value,
      page: data.page,
      ...data.props,
    },
  })
})

// Conversion funnel tracking
export const trackFunnelStep = trackIfAllowed((data: { funnel: string; step: string; stepNumber: number; props?: Record<string, any> }) => {
  trackEvent('Funnel Step', {
    props: {
      funnel: data.funnel,
      step: data.step,
      stepNumber: data.stepNumber,
      ...data.props,
    },
  })
})

// A/B testing tracking
export const trackExperiment = trackIfAllowed((data: { experimentName: string; variant: string; props?: Record<string, any> }) => {
  trackEvent('Experiment View', {
    props: {
      experimentName: data.experimentName,
      variant: data.variant,
      ...data.props,
    },
  })
})

// Custom goal tracking
export const trackGoal = trackIfAllowed((goalName: string, data?: { value?: number; currency?: string; props?: Record<string, any> }) => {
  trackEvent(goalName, {
    props: data?.props,
    revenue: data?.value && data?.currency ? {
      amount: data.value,
      currency: data.currency,
    } : undefined,
  })
})