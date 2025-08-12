// Aurora UI Components Library
// Built with shadcn/ui and Radix UI primitives

// Utility functions
export * from './lib/utils'

// Base components
export * from './components/accordion'
export * from './components/alert'
export * from './components/alert-dialog'
export * from './components/aspect-ratio'
export * from './components/avatar'
export * from './components/badge'
export * from './components/breadcrumb'
export * from './components/button'
export * from './components/calendar'
export * from './components/card'
export * from './components/carousel'
export * from './components/chart'
export * from './components/checkbox'
export * from './components/collapsible'
export * from './components/command'
export * from './components/context-menu'
export * from './components/dialog'
export * from './components/drawer'
export * from './components/dropdown-menu'
export * from './components/form'
export * from './components/hover-card'
export * from './components/input'
export * from './components/input-otp'
export * from './components/label'
export * from './components/menubar'
export * from './components/navigation-menu'
export * from './components/pagination'
export * from './components/popover'
export * from './components/progress'
export * from './components/radio-group'
export * from './components/resizable'
export * from './components/scroll-area'
export * from './components/select'
export * from './components/separator'
export * from './components/sheet'
export * from './components/sidebar'
export * from './components/skeleton'
export * from './components/slider'
export * from './components/sonner'
export * from './components/switch'
export * from './components/table'
export * from './components/tabs'
export * from './components/textarea'
export * from './components/toast'
export { Toaster as ToastToaster } from './components/toaster'
export * from './components/toggle'
export * from './components/toggle-group'
export * from './components/tooltip'

// Hooks
export * from './hooks/use-toast'
export * from './hooks/use-mobile'

// Note: Lucide React icons should be imported directly from 'lucide-react' in your components
// to avoid potential displayName conflicts during build

// CSS variables for theming
export const cssVariables = `
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
`