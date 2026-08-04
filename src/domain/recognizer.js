// Riconoscimento scrittura pluggabile: nessuno (default) o OCR cloud con API key.
// Su iPad Safari PencilKit non è disponibile per le PWA, quindi il riconoscimento
// on-device non esiste: il modulo cloud resta spento finché l'utente non inserisce una key.
import { drawStroke } from './ink.js'

export class NoneRecognizer {
  constructor() {
    this.name = 'Nessuno'
    this.ready = true
  }

  async recognize() {
    return ''
  }
}

export const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate'

/**
 * OCR cloud (Google Cloud Vision) — attivo solo con apiKey.
 * Rende i tratti su un canvas offscreen, li converte in PNG e li invia a Vision.
 */
export class CloudOCRRecognizer {
  constructor(apiKey = '', endpoint = VISION_ENDPOINT) {
    this.name = 'Cloud OCR'
    this.apiKey = apiKey
    this.endpoint = endpoint
    this.ready = Boolean(apiKey)
  }

  _renderToBlob(strokes, { width = 1200, height = 1600, background = '#faf3e0' } = {}) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
    ctx.scale(width / 1000, height / 1300)
    // Le coordinate dei tratti sono in px CSS; le ridimensioniamo al canvas di lavoro.
    for (const stroke of strokes) drawStroke(ctx, stroke)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  async recognize(strokes, lang = 'it') {
    if (!this.ready || !strokes?.length) return ''
    const blob = await this._renderToBlob(strokes)
    const body = {
      requests: [{
        image: { content: await blobToBase64(blob) },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        imageContext: { languageHints: [lang === 'it' ? 'it' : 'en'] },
      }],
    }
    const response = await fetch(`${this.endpoint}?key=${encodeURIComponent(this.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`OCR fallito (${response.status})`)
    const data = await response.json()
    return data?.responses?.[0]?.fullTextAnnotation?.text ?? ''
  }
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/** Factory: con key → CloudOCR, senza → None. */
export function createRecognizer(apiKey = '') {
  return apiKey ? new CloudOCRRecognizer(apiKey) : new NoneRecognizer()
}
