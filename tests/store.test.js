import 'fake-indexeddb/auto'
import { describe, expect, it, beforeEach } from 'vitest'
import { createJournalStore } from '../src/data/store.js'

function makeStore() {
  return createJournalStore(`test-${crypto.randomUUID()}`)
}

describe('journal store', () => {
  let store

  beforeEach(() => {
    store = makeStore()
  })

  it('creates a notebook and lists it', async () => {
    const notebook = await store.saveNotebook({
      id: 'nb1', title: 'Diario', coverColor: '#8a6f4d',
      paperType: 'lined', createdAt: '2026-08-04T00:00:00Z', updatedAt: '2026-08-04T00:00:00Z',
    })
    expect(notebook.id).toBe('nb1')
    const list = await store.listNotebooks()
    expect(list.map((nb) => nb.title)).toContain('Diario')
  })

  it('creates one page per date and reuses the existing one', async () => {
    const page = await store.createPage({ notebookId: 'nb1', date: '2026-08-04' })
    expect(page.notebookId).toBe('nb1')
    const again = await store.createPage({ notebookId: 'nb1', date: '2026-08-04' })
    expect(again.id).toBe(page.id)
    const byDate = await store.getPageByDate('nb1', '2026-08-04')
    expect(byDate.id).toBe(page.id)
  })

  it('persists handwritingEnabled on the page', async () => {
    const page = await store.createPage({ notebookId: 'nb1', date: '2026-08-05', handwritingEnabled: true })
    expect(page.handwritingEnabled).toBe(true)
    const loaded = await store.getPage(page.id)
    expect(loaded.handwritingEnabled).toBe(true)
  })

  it('saves and lists strokes per page', async () => {
    const page = await store.createPage({ notebookId: 'nb1', date: '2026-08-06' })
    const stroke = {
      id: 'st1', pageId: page.id, tool: 'pen', color: '#2c2416', width: 3.6,
      samples: [{ x: 1, y: 2, pressure: 0.5 }], createdAt: Date.now(),
    }
    await store.saveStrokes([stroke])
    const strokes = await store.listStrokes(page.id)
    expect(strokes).toHaveLength(1)
    expect(strokes[0].samples[0].x).toBe(1)
  })

  it('exports data with schemaVersion and imports it back', async () => {
    await store.saveNotebook({ id: 'nb1', title: 'Diario', coverColor: '#8a6f4d', paperType: 'lined', createdAt: 'x', updatedAt: 'x' })
    const page = await store.createPage({ notebookId: 'nb1', date: '2026-08-07' })
    await store.saveStrokes([{ id: 'st1', pageId: page.id, tool: 'pen', color: '#2c2416', width: 3, samples: [{ x: 0, y: 0, pressure: 0.5 }], createdAt: 1 }])

    const backup = await store.exportData()
    expect(backup.schemaVersion).toBe(1)
    expect(backup.notebooks).toHaveLength(1)
    expect(backup.strokes).toHaveLength(1)

    const other = makeStore()
    await other.importData(backup)
    expect(await other.listNotebooks()).toHaveLength(1)
    expect((await other.listStrokes(page.id)).length).toBeGreaterThan(0)
  })

  it('rejects backups with a different schema version', async () => {
    await expect(store.importData({ schemaVersion: 99 })).rejects.toThrow(/non compatibile/)
  })

  it('stores and retrieves settings by key', async () => {
    await store.setSetting('apiKey', 'abc123')
    expect(await store.getSetting('apiKey')).toBe('abc123')
    expect(await store.getSetting('missing', 'fallback')).toBe('fallback')
  })

  it('deletes a notebook with its pages and strokes', async () => {
    await store.saveNotebook({ id: 'nb1', title: 'X', coverColor: '#8a6f4d', paperType: 'lined', createdAt: 'x', updatedAt: 'x' })
    const page = await store.createPage({ notebookId: 'nb1', date: '2026-08-08' })
    await store.saveStrokes([{ id: 'st1', pageId: page.id, tool: 'pen', color: '#2c2416', width: 3, samples: [{ x: 0, y: 0, pressure: 0.5 }], createdAt: 1 }])
    await store.deleteNotebook('nb1')
    expect(await store.listNotebooks()).toHaveLength(0)
    expect(await store.getPage(page.id)).toBeUndefined()
    expect(await store.listStrokes(page.id)).toHaveLength(0)
  })
})
