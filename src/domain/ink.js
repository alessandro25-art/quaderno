// Dominio inchiostro: campionamento, smoothing, larghezza e rendering dei tratti.

export const TOOLS = {
  PEN: 'pen',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
}

export const INK_COLORS = {
  black: '#2c2416',
  blue: '#1a3a5c',
  green: '#2d4a22',
  red: '#7a2e2e',
}

export const PEN_WIDTHS = {
  fine: 2.2,
  medium: 3.6,
  thick: 5.2,
}

/** Larghezza tratto: pressione 0 → 30% della base, 1 → 100%; tilt modula ±15%. */
export function computeStrokeWidth(base, pressure = 0.5, tiltY = 0) {
  const p = Math.max(0, Math.min(1, pressure))
  const width = base * (0.3 + 0.7 * p)
  const tiltFactor = 1 + Math.max(-1, Math.min(1, tiltY)) * 0.15
  return Math.max(0.5, width * tiltFactor)
}

/** Media mobile a 3 campioni per ridurre il jitter. */
export function smoothedSamples(samples) {
  if (samples.length <= 2) return samples.map((s) => ({ ...s }))
  const out = [samples[0], ...samples.slice(1, -1).map((s, i) => {
    const prev = samples[i]
    const next = samples[i + 2]
    return {
      x: (prev.x + s.x + next.x) / 3,
      y: (prev.y + s.y + next.y) / 3,
      pressure: (prev.pressure + s.pressure + next.pressure) / 3,
      tiltY: ((prev.tiltY ?? 0) + (s.tiltY ?? 0) + (next.tiltY ?? 0)) / 3,
    }
  }), samples[samples.length - 1]]
  return out
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Disegna un tratto su ctx con curve quadratiche attraverso i punti medi. */
export function drawStroke(ctx, stroke) {
  const samples = stroke.samples
  if (!samples || samples.length === 0) return

  if (stroke.tool === TOOLS.HIGHLIGHTER) {
    ctx.save()
    ctx.globalAlpha = 0.28
    ctx.strokeStyle = '#e8c84a'
    ctx.lineWidth = stroke.width * 3.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    if (samples.length === 1) {
      const s = samples[0]
      ctx.moveTo(s.x - stroke.width, s.y)
      ctx.lineTo(s.x + stroke.width, s.y)
    } else {
      ctx.moveTo(samples[0].x, samples[0].y)
      for (let i = 1; i < samples.length - 1; i += 1) {
        ctx.quadraticCurveTo(samples[i].x, samples[i].y, midpoint(samples[i], samples[i + 1]).x, midpoint(samples[i], samples[i + 1]).y)
      }
      const last = samples[samples.length - 1]
      ctx.lineTo(last.x, last.y)
    }
    ctx.stroke()
    ctx.restore()
    return
  }

  ctx.save()
  ctx.strokeStyle = stroke.color ?? INK_COLORS.black
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (samples.length === 1) {
    const s = samples[0]
    ctx.lineWidth = computeStrokeWidth(stroke.width, s.pressure, s.tiltY)
    ctx.beginPath()
    ctx.moveTo(s.x - 0.1, s.y)
    ctx.lineTo(s.x + 0.1, s.y)
    ctx.stroke()
    ctx.restore()
    return
  }
  // Tratto segmentato con larghezza variabile: ogni coppia di campioni è un tratto a sé.
  for (let i = 0; i < samples.length - 1; i += 1) {
    const a = samples[i]
    const b = samples[i + 1]
    const width = (computeStrokeWidth(stroke.width, a.pressure, a.tiltY) + computeStrokeWidth(stroke.width, b.pressure, b.tiltY)) / 2
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.restore()
}

/** Renderizza un insieme di tratti su un canvas (o un contesto offscreen). */
export function renderStrokes(canvas, strokes, { clear = true } = {}) {
  const ctx = canvas.getContext('2d')
  if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (const stroke of strokes) drawStroke(ctx, stroke)
}

/** Unisce i sample coalescenti del pointer event in un punto normalizzato. */
export function pointerToSample(event, canvasRect) {
  return {
    x: event.clientX - canvasRect.left,
    y: event.clientY - canvasRect.top,
    pressure: typeof event.pressure === 'number' && event.pressure > 0 ? event.pressure : 0.5,
    tiltY: typeof event.tiltY === 'number' && Number.isFinite(event.tiltY) ? event.tiltY / 90 : 0,
  }
}

/** Gestore di palmo: scarta tocchi che arrivano subito dopo la penna. */
export class PalmGuard {
  constructor({ windowMs = 300, distancePx = 50 } = {}) {
    this.windowMs = windowMs
    this.distancePx = distancePx
    this.lastPenAt = 0
    this.lastPenX = 0
    this.lastPenY = 0
  }

  notePen(x, y) {
    this.lastPenAt = performance.now()
    this.lastPenX = x
    this.lastPenY = y
  }

  shouldIgnoreTouch(x, y) {
    if (performance.now() - this.lastPenAt > this.windowMs) return false
    const dx = x - this.lastPenX
    const dy = y - this.lastPenY
    return Math.hypot(dx, dy) < this.distancePx
  }
}
