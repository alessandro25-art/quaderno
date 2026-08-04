import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Modulo virtuale di vite-plugin-pwa: non esiste in ambiente di test.
vi.mock('virtual:pwa-register', () => ({
  registerSW: () => () => {},
}))

// jsdom non implementa il contesto 2D: stub funzionante per i test.
const ctxStub = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) })
    if (prop === 'canvas') return document.createElement('canvas')
    return () => {}
  },
  set() { return true },
})

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext() { return ctxStub }
  HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
    callback(new Blob(['fake-image'], { type: 'image/png' }))
  }
  HTMLCanvasElement.prototype.toDataURL = function toDataURL() { return 'data:image/png;base64,ZmFrZQ==' }
}

// ResizeObserver non esiste in jsdom.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// matchMedia per display-mode.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
}
