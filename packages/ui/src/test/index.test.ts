import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'
import { useMobile } from '../hooks/use-mobile'
import { toast, useToast } from '../hooks/use-toast'

// Mock window.matchMedia for mobile hook tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('UI Package Exports', () => {
  describe('cn utility function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('should handle empty strings', () => {
      expect(cn('base', '', 'end')).toBe('base end')
    })

    it('should merge tailwind classes correctly', () => {
      // Test that conflicting classes are resolved properly
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      expect(cn({
        'class1': true,
        'class2': false,
        'class3': true
      })).toBe('class1 class3')
    })
  })

  describe('useMobile hook', () => {
    it('should be defined', () => {
      expect(useMobile).toBeDefined()
      expect(typeof useMobile).toBe('function')
    })
  })

  describe('toast functionality', () => {
    it('should export toast function', () => {
      expect(toast).toBeDefined()
      expect(typeof toast).toBe('function')
    })

    it('should export useToast hook', () => {
      expect(useToast).toBeDefined()
      expect(typeof useToast).toBe('function')
    })

    it('should handle basic toast call', () => {
      // Basic test to ensure toast function can be called
      expect(() => {
        toast({
          title: 'Test Toast',
          description: 'This is a test toast message'
        })
      }).not.toThrow()
    })

    it('should handle toast with different variants', () => {
      expect(() => {
        toast({
          title: 'Success',
          description: 'Operation completed successfully',
          variant: 'default'
        })
      }).not.toThrow()

      expect(() => {
        toast({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'destructive'
        })
      }).not.toThrow()
    })
  })
})

// Test component exports are available
describe('Component Exports', () => {
  it('should export main components', async () => {
    // Test that main components can be imported
    const { Button } = await import('../components/button')
    const { Card } = await import('../components/card')
    const { Input } = await import('../components/input')
    const { Label } = await import('../components/label')
    const { Textarea } = await import('../components/textarea')
    
    expect(Button).toBeDefined()
    expect(Card).toBeDefined()
    expect(Input).toBeDefined()
    expect(Label).toBeDefined()
    expect(Textarea).toBeDefined()
  })

  it('should export form components', async () => {
    const { Form } = await import('../components/form')
    const { Checkbox } = await import('../components/checkbox')
    const { RadioGroup } = await import('../components/radio-group')
    const { Select } = await import('../components/select')
    const { Switch } = await import('../components/switch')
    
    expect(Form).toBeDefined()
    expect(Checkbox).toBeDefined()
    expect(RadioGroup).toBeDefined()
    expect(Select).toBeDefined()
    expect(Switch).toBeDefined()
  })

  it('should export layout components', async () => {
    const { Card } = await import('../components/card')
    const { Separator } = await import('../components/separator')
    const { Tabs } = await import('../components/tabs')
    const { Sheet } = await import('../components/sheet')
    const { Dialog } = await import('../components/dialog')
    
    expect(Card).toBeDefined()
    expect(Separator).toBeDefined()
    expect(Tabs).toBeDefined()
    expect(Sheet).toBeDefined()
    expect(Dialog).toBeDefined()
  })

  it('should export feedback components', async () => {
    const { Alert } = await import('../components/alert')
    const { Badge } = await import('../components/badge')
    const { Progress } = await import('../components/progress')
    const { Skeleton } = await import('../components/skeleton')
    const { Toast } = await import('../components/toast')
    
    expect(Alert).toBeDefined()
    expect(Badge).toBeDefined()
    expect(Progress).toBeDefined()
    expect(Skeleton).toBeDefined()
    expect(Toast).toBeDefined()
  })

  it('should export navigation components', async () => {
    const { Breadcrumb } = await import('../components/breadcrumb')
    const { NavigationMenu } = await import('../components/navigation-menu')
    const { Pagination } = await import('../components/pagination')
    const { Sidebar } = await import('../components/sidebar')
    
    expect(Breadcrumb).toBeDefined()
    expect(NavigationMenu).toBeDefined()
    expect(Pagination).toBeDefined()
    expect(Sidebar).toBeDefined()
  })
})