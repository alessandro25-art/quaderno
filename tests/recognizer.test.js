import { describe, expect, it, vi, afterEach } from 'vitest'
import { NoneRecognizer, CloudOCRRecognizer, createRecognizer } from '../src/domain/recognizer.js'

describe('recognizers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('none recognizer is ready and returns empty text', async () => {
    const recognizer = new NoneRecognizer()
    expect(recognizer.name).toBe('Nessuno')
    expect(recognizer.ready).toBe(true)
    expect(await recognizer.recognize([{ samples: [] }])).toBe('')
  })

  it('factory returns None without a key and CloudOCR with one', () => {
    expect(createRecognizer('').constructor.name).toBe('NoneRecognizer')
    expect(createRecognizer('key-123').constructor.name).toBe('CloudOCRRecognizer')
    expect(createRecognizer('key-123').ready).toBe(true)
  })

  it('cloud recognizer is not ready without a key', () => {
    expect(new CloudOCRRecognizer('').ready).toBe(false)
  })

  it('cloud recognizer posts rendered strokes to Vision and returns text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responses: [{ fullTextAnnotation: { text: 'ciao mondo' } }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('btoa', (s) => Buffer.from(s, 'binary').toString('base64'))

    const recognizer = new CloudOCRRecognizer('test-key')
    recognizer._renderToBlob = async () => new Blob(['png-data'], { type: 'image/png' })

    const text = await recognizer.recognize([{ tool: 'pen', width: 3, color: '#2c2416', samples: [{ x: 1, y: 1, pressure: 0.5 }] }], 'it')
    expect(text).toBe('ciao mondo')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('vision.googleapis.com')
    expect(url).toContain('test-key')
    expect(init.body).toContain('DOCUMENT_TEXT_DETECTION')
  })

  it('throws on failed OCR response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }))
    const recognizer = new CloudOCRRecognizer('bad-key')
    recognizer._renderToBlob = async () => new Blob(['x'])
    await expect(recognizer.recognize([{ samples: [{ x: 0, y: 0, pressure: 0.5 }] }])).rejects.toThrow(/403/)
  })
})
