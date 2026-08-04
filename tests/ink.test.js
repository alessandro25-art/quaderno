import { describe, expect, it } from 'vitest'
import {
  TOOLS, INK_COLORS, PEN_WIDTHS, computeStrokeWidth,
  smoothedSamples, drawStroke, PalmGuard,
} from '../src/domain/ink.js'

function mockContext() {
  const calls = { strokes: 0, alpha: null, style: null }
  const ctx = {
    save: () => {}, restore: () => {},
    beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
    quadraticCurveTo: () => {}, clearRect: () => {}, fillRect: () => {},
    scale: () => {}, fill: () => {},
    stroke: () => { calls.strokes += 1 },
    set globalAlpha(v) { calls.alpha = v },
    set strokeStyle(v) { calls.style = v },
    set lineWidth(v) {},
    set lineCap(v) {},
    set lineJoin(v) {},
    set fillStyle(v) {},
    getImageData: () => ({ data: [0, 0, 0, 255] }),
  }
  return { ctx, calls }
}

describe('ink domain', () => {
  it('maps pressure 0 → 30% of base and 1 → 100%', () => {
    expect(computeStrokeWidth(10, 0, 0)).toBeCloseTo(3, 5)
    expect(computeStrokeWidth(10, 1, 0)).toBeCloseTo(10, 5)
    expect(computeStrokeWidth(10, 0.5, 0)).toBeCloseTo(6.5, 5)
  })

  it('modulates width with tilt within ±15%', () => {
    const tilted = computeStrokeWidth(10, 0.5, 0.5)
    const flat = computeStrokeWidth(10, 0.5, 0)
    expect(tilted).toBeGreaterThan(flat)
    expect(tilted / flat).toBeLessThan(1.16)
    expect(computeStrokeWidth(10, 0.5, 2)).toBeCloseTo(flat * 1.15, 5)
  })

  it('clamps pressure outside 0..1', () => {
    expect(computeStrokeWidth(10, -1, 0)).toBeCloseTo(3, 5)
    expect(computeStrokeWidth(10, 2, 0)).toBeCloseTo(10, 5)
  })

  it('smooths with a 3-sample moving average', () => {
    const samples = [
      { x: 0, y: 0, pressure: 0.5 },
      { x: 6, y: 0, pressure: 0.5 },
      { x: 12, y: 0, pressure: 0.5 },
    ]
    const out = smoothedSamples(samples)
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual(samples[0])
    expect(out[1].x).toBeCloseTo(6, 5)
    expect(out[2].x).toBe(12)
  })

  it('keeps short strokes unchanged', () => {
    const one = [{ x: 1, y: 1, pressure: 1 }]
    expect(smoothedSamples(one)).toEqual(one)
    expect(smoothedSamples([])).toEqual([])
  })

  it('draws a single-sample pen stroke without errors', () => {
    const { ctx, calls } = mockContext()
    drawStroke(ctx, {
      tool: TOOLS.PEN, color: INK_COLORS.blue, width: PEN_WIDTHS.medium,
      samples: [{ x: 50, y: 50, pressure: 0.8 }],
    })
    expect(calls.strokes).toBeGreaterThan(0)
    expect(calls.style).toBe(INK_COLORS.blue)
  })

  it('draws a highlighter stroke with low alpha', () => {
    const { ctx, calls } = mockContext()
    drawStroke(ctx, {
      tool: TOOLS.HIGHLIGHTER, color: '#e8c84a', width: 6,
      samples: [
        { x: 10, y: 10, pressure: 0.5 },
        { x: 90, y: 10, pressure: 0.5 },
      ],
    })
    expect(calls.alpha).toBe(0.28)
    expect(calls.strokes).toBeGreaterThan(0)
  })

  it('palm guard ignores touch near the last pen stroke within the window', () => {
    const guard = new PalmGuard()
    guard.notePen(100, 100)
    expect(guard.shouldIgnoreTouch(105, 103)).toBe(true)
    expect(guard.shouldIgnoreTouch(300, 300)).toBe(false)
  })
})
