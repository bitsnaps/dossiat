/**
 * Centralized file upload validation helper.
 *
 * Extracts and reuses the avatar validation logic so all upload endpoints
 * (avatars, mission attachments, message attachments) enforce the same
 * size and MIME-type constraints.
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const DEFAULT_MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB

export interface UploadValidationOptions {
  /** Allowed MIME types. Defaults to ALLOWED_IMAGE_TYPES. */
  allowedTypes?: readonly string[]
  /** Max file size in bytes. Defaults to DEFAULT_MAX_AVATAR_SIZE. */
  maxSize?: number
}

export interface UploadValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate a `File` against size and type constraints.
 * Returns `{ valid: true }` on success, or `{ valid: false, error }` on failure.
 */
export function validateFileUpload(
  file: File | null | undefined,
  opts: UploadValidationOptions = {},
): UploadValidationResult {
  const allowedTypes = opts.allowedTypes ?? ALLOWED_IMAGE_TYPES
  const maxSize = opts.maxSize ?? DEFAULT_MAX_AVATAR_SIZE

  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided' }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Resolve the file extension for a given MIME type.
 */
export function extensionForType(type: string): string {
  switch (type) {
    case 'image/jpeg':
      return '.jpg'
    case 'image/png':
      return '.png'
    case 'image/webp':
      return '.webp'
    default:
      return ''
  }
}
