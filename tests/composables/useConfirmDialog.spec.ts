import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

describe('useConfirmDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('default state', () => {
    it('isVisible is false initially', () => {
      const { isVisible } = useConfirmDialog()
      expect(isVisible.value).toBe(false)
    })

    it('title is empty initially', () => {
      const { title } = useConfirmDialog()
      expect(title.value).toBe('')
    })

    it('message is empty initially', () => {
      const { message } = useConfirmDialog()
      expect(message.value).toBe('')
    })

    it('confirmLabel defaults to "Confirm"', () => {
      const { confirmLabel } = useConfirmDialog()
      expect(confirmLabel.value).toBe('Confirm')
    })

    it('cancelLabel defaults to "Cancel"', () => {
      const { cancelLabel } = useConfirmDialog()
      expect(cancelLabel.value).toBe('Cancel')
    })
  })

  describe('showConfirm()', () => {
    it('sets visible to true', async () => {
      const { showConfirm, isVisible, cancel } = useConfirmDialog()
      const promise = showConfirm({ title: 'Delete?', message: 'Are you sure?' })
      expect(isVisible.value).toBe(true)
      cancel()
      await promise
    })

    it('sets title and message from options', async () => {
      const { showConfirm, title, message, cancel } = useConfirmDialog()
      const promise = showConfirm({ title: 'Delete?', message: 'Are you sure?' })
      expect(title.value).toBe('Delete?')
      expect(message.value).toBe('Are you sure?')
      cancel()
      await promise
    })

    it('resolves to true when confirm() is called', async () => {
      const { showConfirm, confirm } = useConfirmDialog()
      const promise = showConfirm({ title: 'Proceed?', message: 'OK?' })
      confirm()
      const result = await promise
      expect(result).toBe(true)
    })

    it('resolves to false when cancel() is called', async () => {
      const { showConfirm, cancel } = useConfirmDialog()
      const promise = showConfirm({ title: 'Proceed?', message: 'OK?' })
      cancel()
      const result = await promise
      expect(result).toBe(false)
    })

    it('sets isVisible to false after confirm()', async () => {
      const { showConfirm, isVisible, confirm } = useConfirmDialog()
      const promise = showConfirm({ title: 'OK?' })
      confirm()
      await promise
      expect(isVisible.value).toBe(false)
    })

    it('sets isVisible to false after cancel()', async () => {
      const { showConfirm, isVisible, cancel } = useConfirmDialog()
      const promise = showConfirm({ title: 'OK?' })
      cancel()
      await promise
      expect(isVisible.value).toBe(false)
    })

    it('accepts custom labels', async () => {
      const { showConfirm, confirmLabel, cancelLabel, cancel } = useConfirmDialog()
      const promise = showConfirm({
        title: 'Delete?',
        confirmLabel: 'Yes, delete',
        cancelLabel: 'No, keep',
      })
      expect(confirmLabel.value).toBe('Yes, delete')
      expect(cancelLabel.value).toBe('No, keep')
      cancel()
      await promise
    })
  })
})
