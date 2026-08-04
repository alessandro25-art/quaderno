import Dexie from 'dexie'

export const SCHEMA_VERSION = 1

export function createJournalStore(dbName = 'quaderno') {
  const db = new Dexie(dbName)
  db.version(1).stores({
    notebooks: 'id, title, createdAt, updatedAt',
    pages: 'id, notebookId, date, [notebookId+date]',
    strokes: 'id, pageId, tool, createdAt',
    questions: 'id, date, lang, [date+lang]',
    tags: 'id, name, pageId',
    settings: '&key',
  })

  async function listNotebooks() {
    return db.notebooks.orderBy('updatedAt').reverse().toArray()
  }

  async function getNotebook(id) {
    return db.notebooks.get(id)
  }

  async function saveNotebook(notebook) {
    await db.notebooks.put(notebook)
    return notebook
  }

  async function deleteNotebook(id) {
    const pages = await db.pages.where('notebookId').equals(id).toArray()
    const pageIds = pages.map((page) => page.id)
    await db.transaction('rw', db.strokes, db.pages, db.notebooks, async () => {
      for (const pageId of pageIds) await db.strokes.where('pageId').equals(pageId).delete()
      await db.pages.where('notebookId').equals(id).delete()
      await db.notebooks.delete(id)
    })
  }

  async function listPages(notebookId) {
    return db.pages.where('notebookId').equals(notebookId).toArray()
  }

  async function getPage(id) {
    return db.pages.get(id)
  }

  async function getPageByDate(notebookId, date) {
    return db.pages.where('[notebookId+date]').equals([notebookId, date]).first()
  }

  async function createPage({ notebookId, date, paperType = 'lined', questionId = null, handwritingEnabled = false }) {
    const existing = await getPageByDate(notebookId, date)
    if (existing) return existing
    const now = new Date().toISOString()
    const page = {
      id: crypto.randomUUID(),
      notebookId,
      date,
      paperType,
      questionId,
      handwritingEnabled,
      recognizedText: '',
      thumbnail: null,
      createdAt: now,
      updatedAt: now,
    }
    await db.pages.put(page)
    await db.notebooks.update(notebookId, { updatedAt: now })
    return page
  }

  async function savePage(page) {
    const updated = { ...page, updatedAt: new Date().toISOString() }
    await db.pages.put(updated)
    await db.notebooks.update(page.notebookId, { updatedAt: updated.updatedAt })
    return updated
  }

  async function deletePage(id) {
    await db.transaction('rw', db.strokes, db.pages, async () => {
      await db.strokes.where('pageId').equals(id).delete()
      await db.pages.delete(id)
    })
  }

  async function listStrokes(pageId) {
    return db.strokes.where('pageId').equals(pageId).sortBy('createdAt')
  }

  async function saveStrokes(strokes) {
    await db.strokes.bulkPut(strokes)
  }

  async function deleteStrokes(pageId) {
    await db.strokes.where('pageId').equals(pageId).delete()
  }

  async function getSetting(key, fallback = undefined) {
    const row = await db.settings.get(key)
    return row ? row.value : fallback
  }

  async function setSetting(key, value) {
    await db.settings.put({ key, value })
  }

  async function getQuestion(date, lang = 'it') {
    return db.questions.where('[date+lang]').equals([date, lang]).first()
  }

  async function saveQuestions(questions) {
    await db.questions.bulkPut(questions)
  }

  async function exportData() {
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      notebooks: await db.notebooks.toArray(),
      pages: await db.pages.toArray(),
      strokes: await db.strokes.toArray(),
      questions: await db.questions.toArray(),
      tags: await db.tags.toArray(),
      settings: await db.settings.toArray(),
    }
  }

  async function importData(backup) {
    if (!backup || backup.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Backup non compatibile (schema ${backup?.schemaVersion ?? 'assente'})`)
    }
    await db.transaction('rw', db.notebooks, db.pages, db.strokes, db.questions, db.tags, db.settings, async () => {
      await Promise.all([
        db.notebooks.clear(),
        db.pages.clear(),
        db.strokes.clear(),
        db.questions.clear(),
        db.tags.clear(),
        db.settings.clear(),
      ])
      if (backup.notebooks?.length) await db.notebooks.bulkPut(backup.notebooks)
      if (backup.pages?.length) await db.pages.bulkPut(backup.pages)
      if (backup.strokes?.length) await db.strokes.bulkPut(backup.strokes)
      if (backup.questions?.length) await db.questions.bulkPut(backup.questions)
      if (backup.tags?.length) await db.tags.bulkPut(backup.tags)
      if (backup.settings?.length) await db.settings.bulkPut(backup.settings)
    })
    return true
  }

  return {
    db,
    listNotebooks,
    getNotebook,
    saveNotebook,
    deleteNotebook,
    listPages,
    getPage,
    getPageByDate,
    createPage,
    savePage,
    deletePage,
    listStrokes,
    saveStrokes,
    deleteStrokes,
    getSetting,
    setSetting,
    getQuestion,
    saveQuestions,
    exportData,
    importData,
  }
}
