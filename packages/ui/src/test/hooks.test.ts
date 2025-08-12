import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobile } from '../hooks/use-mobile'
import { useToast, toast } from '../hooks/use-toast'

// Mock window.matchMedia
const mockMatchMedia = vi.fn()

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('UI Hooks', () => {
  describe('useMobile', () => {
    it('should return false when screen is desktop size', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useMobile())
      expect(result.current).toBe(false)
    })

    it('should return true when screen is mobile size', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useMobile())
      expect(result.current).toBe(true)
    })

    it('should use correct media query', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      renderHook(() => useMobile())
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)')
    })

    it('should update when media query changes', () => {
      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null
      
      mockMatchMedia.mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, callback) => {
          if (event === 'change') {
            mediaQueryCallback = callback
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { result } = renderHook(() => useMobile())
      expect(result.current).toBe(false)

      // Simulate media query change
      if (mediaQueryCallback) {
        act(() => {
          mediaQueryCallback({ matches: true } as MediaQueryListEvent)
        })
      }

      expect(result.current).toBe(true)
    })
  })

  describe('useToast', () => {
    it('should return toast functions', () => {
      const { result } = renderHook(() => useToast())
      
      expect(result.current).toHaveProperty('toast')
      expect(result.current).toHaveProperty('dismiss')
      expect(result.current).toHaveProperty('toasts')
      expect(typeof result.current.toast).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
      expect(Array.isArray(result.current.toasts)).toBe(true)
    })

    it('should add toast when toast function is called', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test'
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Test Toast',
        description: 'This is a test'
      })
    })

    it('should dismiss toast when dismiss function is called', () => {
      const { result } = renderHook(() => useToast())
      
      // Add a toast
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test'
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      const toastId = result.current.toasts[0].id

      // Dismiss the toast
      act(() => {
        result.current.dismiss(toastId)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should handle multiple toasts', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })

      expect(result.current.toasts).toHaveLength(3)
      expect(result.current.toasts[0].title).toBe('Toast 1')
      expect(result.current.toasts[1].title).toBe('Toast 2')
      expect(result.current.toasts[2].title).toBe('Toast 3')
    })

    it('should handle toast with different variants', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Success',
          variant: 'default'
        })
      })

      act(() => {
        result.current.toast({
          title: 'Error',
          variant: 'destructive'
        })
      })

      expect(result.current.toasts).toHaveLength(2)
      expect(result.current.toasts[0].variant).toBe('default')
      expect(result.current.toasts[1].variant).toBe('destructive')
    })

    it('should auto-dismiss toasts after duration', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Auto dismiss',
          duration: 1000
        })
      })

      expect(result.current.toasts).toHaveLength(1)

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.toasts).toHaveLength(0)
      
      vi.useRealTimers()
    })
  })

  describe('toast function (standalone)', () => {
    it('should be callable without hook', () => {
      expect(() => {
        toast({
          title: 'Standalone toast',
          description: 'This should work'
        })
      }).not.toThrow()
    })

    it('should accept all toast options', () => {
      expect(() => {
        toast({
          title: 'Complete toast',
          description: 'With all options',
          variant: 'destructive',
          duration: 5000,
          action: {
            altText: 'Undo',
            label: 'Undo',
            onClick: () => {}
          }
        })
      }).not.toThrow()
    })
  })
})