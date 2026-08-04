import { describe, expect, it } from 'vitest'
import { buildPdf, isValidPdfHeader, A4 } from '../src/domain/pdf.js'

// JPEG 1x1 minimale valido (grigio)
const TINY_JPEG = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=='

describe('pdf export', () => {
  it('builds a valid minimal PDF with the JPEG embedded', () => {
    const bytes = buildPdf(TINY_JPEG, 800, 600, 24)
    expect(isValidPdfHeader(bytes)).toBe(true)
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain('/Type /Catalog')
    expect(text).toContain('/DCTDecode')
    expect(text).toContain('startxref')
    expect(text).toContain('%%EOF')
  })

  it('keeps the image within the A4 content box', () => {
    const bytes = buildPdf(TINY_JPEG, 2000, 2000, 24)
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain('/MediaBox [0 0 595.28 841.89]')
    expect(A4.width).toBe(595.28)
    expect(A4.height).toBe(841.89)
  })

  it('rejects empty images via the export wrapper', async () => {
    const { exportCanvasAsPdf } = await import('../src/domain/pdf.js')
    const fakeCanvas = { toBlob: (cb) => cb(null) }
    await expect(exportCanvasAsPdf(fakeCanvas)).rejects.toThrow(/Export non riuscito/)
  })
})
