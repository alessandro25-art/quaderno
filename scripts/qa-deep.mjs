// QA profondo: usa Quaderno come un utente reale, su tutti i flussi.
// Emula iPad (portrait e landscape), scrive, cancella, naviga, esporta, e
// registra ogni bug (console, stato, overflow, persistenza).
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const qaDir = new URL('file://' + join(root, 'artifacts', 'qa') + '/')
mkdirSync(new URL(qaDir).pathname, { recursive: true })
const qaPath = (name) => new URL(name, qaDir).pathname

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4178'
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4178', '--strictPort'], {
  cwd: root, stdio: 'ignore',
})
const report = { checks: [], consoleErrors: [], downloads: [] }
let failed = false

function check(name, ok, detail = '') {
  report.checks.push({ name, ok, detail })
  if (!ok) { failed = true; console.error(`✗ ${name} ${detail}`) }
  else console.log(`✓ ${name}`)
}

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return } catch { /* riprova */ }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Server non raggiungibile: ${url}`)
}

// Eventi penna sintetici su un elemento
async function pen(page, selector, points, { pointerType = 'pen', pressure = 0.8, tiltY = 5 } = {}) {
  await page.evaluate(({ selector, points, pointerType, pressure, tiltY }) => {
    const el = document.querySelector(selector)
    const rect = el.getBoundingClientRect()
    const mk = (type, x, y, id) => new PointerEvent(type, {
      pointerId: id, pointerType, isPrimary: true, bubbles: true,
      clientX: rect.left + x, clientY: rect.top + y, pressure, tiltX: 0, tiltY,
    })
    el.dispatchEvent(mk('pointerdown', points[0][0], points[0][1], 7))
    for (let i = 1; i < points.length; i += 1) {
      el.dispatchEvent(mk('pointermove', points[i][0], points[i][1], 7))
    }
    el.dispatchEvent(mk('pointerup', points[points.length - 1][0], points[points.length - 1][1], 7))
  }, { selector, points, pointerType, pressure, tiltY })
}

async function strokeCount(page) {
  return page.evaluate(async () => {
    // legge il layer: conta pixel non bianchi per capire se c'è inchiostro
    const canvas = document.querySelector('.ink-layer')
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let painted = 0
    for (let i = 3; i < data.length; i += 16) { if (data[i] > 0) painted += 1 }
    return painted
  })
}

try {
  await waitForServer(baseURL)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })
  page.on('console', (msg) => { if (msg.type() === 'error') report.consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => report.consoleErrors.push(`pageerror: ${err.message}`))
  page.on('download', (d) => report.downloads.push(d.suggestedFilename()))

  // ── BOOT ────────────────────────────────────────────────────────────────
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /i tuoi quaderni/i }).waitFor()
  check('boot: cover mostrata', true)
  await page.screenshot({ path: qaPath('01-cover.png') })

  // ── APERTURA QUADERNO + FLUSSO DOMANDE ─────────────────────────────────
  await page.locator('.notebook-card').first().click()
  await page.getByText('Domanda del giorno').first().waitFor()
  check('notebook: aperto', true)
  check('flusso: 1/5 all’inizio', (await page.locator('.section-progress').innerText()).includes('1 / 5'))
  await page.screenshot({ path: qaPath('02-q1.png'), fullPage: true })

  // Scrivi sulla prima domanda
  const paper = '.page-section.full .paper'
  await pen(page, paper, [[80, 120], [150, 140], [220, 130], [300, 155]])
  await page.waitForTimeout(300)
  const ink1 = await strokeCount(page)
  check('scrittura: inchiostro presente', ink1 > 0, `pixel=${ink1}`)

  // Evidenziatore
  await page.getByRole('button', { name: 'Evidenziatore' }).click()
  await pen(page, paper, [[100, 200], [250, 210]])
  await page.waitForTimeout(250)
  check('evidenziatore: scrive', (await strokeCount(page)) > ink1)

  // Doppio tap → gomma
  await page.getByRole('button', { name: 'Penna' }).click()
  await pen(page, paper, [[400, 300], [400, 300]])
  await pen(page, paper, [[400, 300], [400, 300]])
  await page.waitForTimeout(450)
  check('doppio tap → gomma attiva', await page.locator('.tool-button[aria-label="Gomma"]').evaluate((e) => e.classList.contains('active')))
  await pen(page, paper, [[400, 300], [400, 300]])
  await pen(page, paper, [[400, 300], [400, 300]])
  await page.waitForTimeout(450)
  check('doppio tap → penna attiva', await page.locator('.tool-button[aria-label="Penna"]').evaluate((e) => e.classList.contains('active')))

  // Gomma: cancella il tratto dell'evidenziatore
  const beforeErase = await strokeCount(page)
  await page.getByRole('button', { name: 'Gomma' }).click()
  await pen(page, paper, [[100, 200], [250, 210]])
  await page.waitForTimeout(300)
  const afterErase = await strokeCount(page)
  check('gomma: cancella', afterErase < beforeErase, `${beforeErase} → ${afterErase}`)
  await page.getByRole('button', { name: 'Penna' }).click()

  // ColorI
  await page.getByRole('button', { name: /inchiostro/i }).first().click()
  await page.getByRole('button', { name: 'Inchiostro rosso' }).click()
  await pen(page, paper, [[120, 420], [180, 430]])
  await page.waitForTimeout(250)
  check('colore: rosso scrive', (await strokeCount(page)) > afterErase)
  await page.screenshot({ path: qaPath('03-q1-written.png') })

  // Undo/redo
  const u1 = await strokeCount(page)
  await page.getByRole('button', { name: 'Annulla' }).click()
  await page.waitForTimeout(250)
  const u2 = await strokeCount(page)
  check('undo: rimuove tratto', u2 < u1, `${u1} → ${u2}`)
  await page.getByRole('button', { name: 'Rifai' }).click()
  await page.waitForTimeout(250)
  check('redo: ripristina tratto', (await strokeCount(page)) === u1)

  // Zoom
  for (let i = 0; i < 4; i += 1) await page.getByRole('button', { name: 'Aumenta zoom' }).click()
  check('zoom: 200%', (await page.locator('.zoom-value').innerText()).trim() === '200%')
  await pen(page, paper, [[150, 500], [200, 520]])
  await page.waitForTimeout(250)
  for (let i = 0; i < 4; i += 1) await page.getByRole('button', { name: 'Riduci zoom' }).click()
  check('zoom: torna a 100%', (await page.locator('.zoom-value').innerText()).trim() === '100%')

  // Flusso: avanza fino alla fine
  for (let i = 0; i < 4; i += 1) {
    await page.getByRole('button', { name: /prossima/i }).click()
  }
  check('flusso: 5/5 raggiunto', (await page.locator('.section-progress').innerText()).includes('5 / 5'))
  await page.screenshot({ path: qaPath('04-q5.png') })

  // Torna indietro con Precedente
  await page.getByRole('button', { name: '← Precedente' }).click()
  check('flusso: Precedente funziona', (await page.locator('.section-progress').innerText()).includes('4 / 5'))
  // torna a 1
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: '← Precedente' }).click()
  check('flusso: Precedente disabilitato a 1/5', await page.getByRole('button', { name: '← Precedente' }).isDisabled())

  // PERSISTENZA: l'inchiostro della q1 è ancora lì tornando indietro
  const inkBack = await strokeCount(page)
  check('persistenza: inchiostro q1 ancora presente', inkBack > 0, `pixel=${inkBack}`)

  // NAVIGAZIONE GIORNI: cambia giorno, scrivi, torna
  await page.getByRole('button', { name: 'Giorno successivo' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  check('giorni: data cambiata', !(await page.locator('.page-date').innerText()).includes('oggi'))
  await pen(page, paper, [[90, 130], [160, 150]])
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Giorno precedente' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  await page.waitForTimeout(600)
  check('giorni: ritorno al giorno 1', (await strokeCount(page)) > 0)
  check('giorni: flusso riparte da 1/5', (await page.locator('.section-progress').innerText()).includes('1 / 5'))
  await page.getByRole('button', { name: 'Torna a oggi' }).click()

  // PDF export
  await page.getByRole('button', { name: 'Esporta pagina in PDF' }).click()
  await page.waitForTimeout(800)
  check('pdf: download innescato', report.downloads.some((name) => name.endsWith('.pdf')), report.downloads.join(','))

  // OCR senza API key → notice
  await page.getByRole('button', { name: 'Attiva riconoscimento scrittura' }).click()
  await page.waitForTimeout(300)
  check('ocr: notice attivazione', (await page.locator('.ocr-panel').innerText()).includes('Riconoscimento scrittura'))
  await page.getByRole('button', { name: 'Riconosci pagina' }).click()
  await page.waitForTimeout(300)
  check('ocr: richiesta API key senza chiave', (await page.locator('.notice-bar').innerText()).includes('API key'))
  await page.getByRole('button', { name: 'Attiva riconoscimento scrittura' }).click()

  // ARCHIVIO
  await page.getByRole('button', { name: 'Archivio' }).click()
  await page.waitForTimeout(400)
  check('archivio: calendario visibile', await page.locator('.archive-view, .calendar, [class*=cal]').first().isVisible().catch(() => false))
  await page.screenshot({ path: qaPath('05-archive.png') })

  // IMPOSTAZIONI: backup export
  await page.getByRole('button', { name: 'Impostazioni' }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Esporta backup' }).click()
  await page.waitForTimeout(800)
  check('backup: download JSON', report.downloads.some((name) => name.endsWith('.json')), report.downloads.join(','))
  await page.screenshot({ path: qaPath('06-settings.png') })

  // Torna indietro: Impostazioni → Archivio (provenienza) → Quaderno → Copertina
  await page.getByRole('button', { name: 'Torna indietro' }).click()
  await page.waitForTimeout(300)
  check('nav: da Impostazioni si torna all’Archivio', await page.locator('.archive-view').isVisible())
  await page.getByRole('button', { name: 'Torna al quaderno' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  await page.getByRole('button', { name: 'Torna ai quaderni' }).click()
  await page.locator('.notebook-card').first().waitFor()

  // NUOVO QUADERNO
  await page.getByRole('button', { name: /nuovo quaderno/i }).click()
  await page.getByLabel('Titolo del quaderno').fill('Sogni')
  await page.getByRole('button', { name: 'Crea quaderno' }).click()
  await page.waitForTimeout(400)
  const cards = await page.locator('.notebook-card').count()
  check('cover: secondo quaderno creato', cards >= 2, `cards=${cards}`)

  // Apri il nuovo quaderno, cambia foglio in Impostazioni
  await page.locator('.notebook-card').filter({ hasText: 'Sogni' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  await page.getByRole('button', { name: 'Impostazioni' }).click()
  await page.waitForTimeout(300)
  await page.getByLabel('Foglio di Sogni').selectOption('lined')
  await page.getByRole('button', { name: 'Torna indietro' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  await page.getByRole('button', { name: 'Torna ai quaderni' }).click()
  await page.locator('.notebook-card').filter({ hasText: 'Sogni' }).click()
  await page.getByText('Domanda del giorno').first().waitFor()
  check('foglio: kindle → righe applicato', (await page.locator('.paper').first().getAttribute('class')).includes('paper-lined'))

  // Screenshot mobile landscape
  await page.screenshot({ path: qaPath('07-notebook-landscape.png') })

  // ── IPAD LANDSCAPE ─────────────────────────────────────────────────────
  const landscape = await browser.newPage({ viewport: { width: 1366, height: 1024 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })
  landscape.on('console', (msg) => { if (msg.type() === 'error') report.consoleErrors.push(`landscape: ${msg.text()}`) })
  await landscape.goto(baseURL, { waitUntil: 'networkidle' })
  await landscape.locator('.notebook-card').first().click()
  await landscape.getByText('Domanda del giorno').first().waitFor()
  const overflowL = await landscape.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check('landscape: nessun overflow orizzontale', overflowL <= 1, `overflow=${overflowL}`)
  await landscape.screenshot({ path: qaPath('08-landscape.png'), fullPage: true })
  await landscape.close()

  // ── OFFLINE ─────────────────────────────────────────────────────────────
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /i tuoi quaderni/i }).waitFor()
  await page.locator('.notebook-card').first().click()
  await page.getByText('Domanda del giorno').first().waitFor()
  const ctx = page.context()
  await ctx.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: /i tuoi quaderni/i }).waitFor()
  check('offline: app funziona senza rete', await page.locator('.notebook-card').first().isVisible())
  await ctx.setOffline(false)

  await browser.close()
} catch (error) {
  console.error('QA FAILED:', error.message)
  process.exit(1)
} finally {
  preview.kill()
}

report.failed = failed
writeFileSync(new URL('report.json', qaDir).pathname, JSON.stringify(report, null, 2))
console.log(`\nCHECK: ${report.checks.filter((c) => c.ok).length}/${report.checks.length} ok — console errors: ${report.consoleErrors.length}`)
if (report.consoleErrors.length) console.error('CONSOLE ERRORS:\n' + report.consoleErrors.join('\n'))
if (failed) { console.error('QA: BUG TROVATI'); process.exit(1) }
console.log('QA OK')
