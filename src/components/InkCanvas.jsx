import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { TOOLS, drawStroke, pointerToSample, smoothedSamples } from '../domain/ink.js'
import { UndoManager } from '../domain/undo.js'
const InkCanvas = forwardRef(function InkCanvas({
  strokes,
  onStrokesChange,
  tool = TOOLS.PEN,
  color = '#2c2416',
  width = 3.6,
  zoom = 1,
  paperType = 'lined',
  pageId = null,
  section = 'free',
  placeholderChar = '',
  onFocus,
  onDoubleTap,
  disabled = false,
}, ref) {
  const containerRef = useRef(null)
  const layerRef = useRef(null)      // tratti confermati
  const activeRef = useRef(null)     // tratto in corso
  const drawingRef = useRef(false)
  const currentStrokeRef = useRef(null)
  const undoRef = useRef(new UndoManager(50))
  const strokesRef = useRef(strokes)
  const lastTinyTapRef = useRef(null)

  strokesRef.current = strokes

  function resizeCanvas(canvas) {
    const rect = containerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }

  function redrawLayer() {
    const canvas = layerRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = containerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr * zoom, dpr * zoom)
    for (const stroke of strokesRef.current) drawStroke(ctx, stroke)
    void rect
  }

  useEffect(() => {
    resizeCanvas(layerRef.current)
    resizeCanvas(activeRef.current)
    redrawLayer()
    const observer = new ResizeObserver(() => {
      resizeCanvas(layerRef.current)
      resizeCanvas(activeRef.current)
      redrawLayer()
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom])

  useEffect(() => {
    redrawLayer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes])

  function activeCtx() {
    return activeRef.current.getContext('2d')
  }

  function clearActive() {
    const ctx = activeCtx()
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, activeRef.current.width, activeRef.current.height)
    ctx.scale(dpr * zoom, dpr * zoom)
  }

  function toLocal(event) {
    const rect = containerRef.current.getBoundingClientRect()
    const sample = pointerToSample(event, rect)
    return { x: sample.x / zoom, y: sample.y / zoom, pressure: sample.pressure, tiltY: sample.tiltY }
  }

  function startStroke(event) {
    if (disabled) return
    // Solo penna e mouse disegnano. Dito e palmo: mai (il dito deve scorrere la pagina).
    if (event.pointerType !== 'pen' && event.pointerType !== 'mouse') return
    drawingRef.current = true
    event.preventDefault()
    try {
      activeRef.current.setPointerCapture(event.pointerId)
    } catch {
      // eventi sintetici o pointer già rilasciato: non blocca la scrittura
    }
    onFocus?.(section)
    currentStrokeRef.current = {
      id: crypto.randomUUID(),
      pageId,
      section,
      tool,
      color,
      width,
      opacity: 1,
      pointerType: event.pointerType,
      samples: [toLocal(event)],
      createdAt: Date.now(),
    }
  }

  function moveStroke(event) {
    if (!drawingRef.current || !currentStrokeRef.current) return
    event.preventDefault()
    const events = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [event]
    for (const ev of events) {
      currentStrokeRef.current.samples.push(toLocal(ev))
    }
    const stroke = currentStrokeRef.current
    const ctx = activeCtx()
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, activeRef.current.width, activeRef.current.height)
    ctx.scale(dpr * zoom, dpr * zoom)
    drawStroke(ctx, { ...stroke, samples: smoothedSamples(stroke.samples) })
  }

  function commit(next) {
    // baseline: primo stato registrato = situazione prima della prima modifica
    if (undoRef.current.states.length === 0) {
      undoRef.current.push(strokesRef.current)
    }
    undoRef.current.push(next)
    onStrokesChange(next)
  }

  function isTinyStroke(stroke) {
    if (stroke.samples.length > 6) return false
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const point of stroke.samples) {
      minX = Math.min(minX, point.x); minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x); maxY = Math.max(maxY, point.y)
    }
    return (maxX - minX) <= 16 && (maxY - minY) <= 16
  }

  function endStroke(event) {
    if (!drawingRef.current) return
    event.preventDefault()
    drawingRef.current = false
    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    if (!stroke || stroke.samples.length === 0) return
    const final = { ...stroke, samples: smoothedSamples(stroke.samples) }

    // Doppio tap della penna (due tocchetti rapidi e minuscoli) → cambia strumento,
    // anche quando si è già in modalità gomma.
    if (stroke.pointerType === 'pen' && isTinyStroke(final)) {
      const now = Date.now()
      const previous = lastTinyTapRef.current
      if (previous && now - previous.time <= 450) {
        lastTinyTapRef.current = null
        if (tool !== TOOLS.ERASER) {
          const remaining = strokesRef.current.filter(
            (existing) => existing.id !== previous.id && existing.id !== final.id,
          )
          if (remaining.length !== strokesRef.current.length) commit(remaining)
        }
        onDoubleTap?.(final)
        clearActive()
        return
      }
      lastTinyTapRef.current = { id: final.id, time: now }
    } else {
      lastTinyTapRef.current = null
    }

    if (tool === TOOLS.ERASER) {
      const remaining = strokesRef.current.filter((existing) => !intersects(existing, final))
      if (remaining.length !== strokesRef.current.length) commit(remaining)
      clearActive()
      return
    }

    commit([...strokesRef.current, final])
    clearActive()
  }

  function intersects(stroke, eraser) {
    const radius = 15
    for (const point of stroke.samples) {
      for (const er of eraser.samples) {
        if (Math.hypot(point.x - er.x, point.y - er.y) <= radius) return true
      }
    }
    return false
  }

  function undo() {
    const snapshot = undoRef.current.undo()
    if (snapshot !== null) onStrokesChange(snapshot)
  }

  function redo() {
    const snapshot = undoRef.current.redo()
    if (snapshot !== null) onStrokesChange(snapshot)
  }

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    canUndo: () => undoRef.current.canUndo,
    canRedo: () => undoRef.current.canRedo,
  }))

  return (
    <div
      ref={containerRef}
      className={`paper paper-${paperType}`}
      style={{ minHeight: 'var(--section-height, calc(100dvh - 350px))' }}
      onPointerDown={startStroke}
      onPointerMove={moveStroke}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
    >
      {strokes.length === 0 && placeholderChar && (
        <span className="drop-cap-ghost" aria-hidden="true">{placeholderChar}</span>
      )}
      <canvas ref={layerRef} className="ink-layer" aria-hidden="true" />
      <canvas ref={activeRef} className="ink-layer" aria-hidden="true" />
    </div>
  )
})

export default InkCanvas
