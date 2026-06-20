import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

describe('useCopyToClipboard', () => {
  describe('isSupported', () => {
    it('is true when navigator.clipboard.writeText is available', () => {
      const original = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn() },
        configurable: true,
      })
      const { isSupported } = useCopyToClipboard()
      expect(isSupported.value).toBe(true)
      Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
    })

    it('is false when navigator.clipboard.writeText is not available', () => {
      const original = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', { value: {}, configurable: true })
      const { isSupported } = useCopyToClipboard()
      expect(isSupported.value).toBe(false)
      Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
    })

    it('is false when navigator.clipboard is undefined', () => {
      const original = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
      const { isSupported } = useCopyToClipboard()
      expect(isSupported.value).toBe(false)
      Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
    })
  })

  describe('copy()', () => {
    it('copies text to clipboard and returns true', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      const { copy, copied } = useCopyToClipboard()
      const result = await copy('hello world')

      expect(result).toBe(true)
      expect(copied.value).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith('hello world')
    })

    it('returns false when clipboard.writeText rejects', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      const { copy, copied } = useCopyToClipboard()
      const result = await copy('hello world')

      expect(result).toBe(false)
      expect(copied.value).toBe(false)
    })

    it('returns false when clipboard is not supported', async () => {
      const original = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })

      const { copy, copied } = useCopyToClipboard()
      const result = await copy('hello world')

      expect(result).toBe(false)
      expect(copied.value).toBe(false)
      Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
    })
  })

  describe('copied state', () => {
    it('copied is false initially', () => {
      const { copied } = useCopyToClipboard()
      expect(copied.value).toBe(false)
    })

    it('copied becomes true after successful copy', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      const { copy, copied } = useCopyToClipboard()
      expect(copied.value).toBe(false)
      await copy('test')
      expect(copied.value).toBe(true)
    })
  })
})
