import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const artifacts = new URL('file://' + join(root, 'artifacts') + '/')
mkdirSync(new URL(artifacts).pathname, { recursive: true })

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4177'
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4177', '--strictPort'], {
  cwd: root, stdio: 'ignore', detached: false,
})
const report = { baseURL, desktop: {}, mobile: {}, offline: {}, pwa: {}, consoleErrors: [] }

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // non ancora pronto
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Server non raggiungibile: ${url}`)
}

try {
  await waitForServer(baseURL)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') report.consoleErrors.push(msg.text())
  })

  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Quaderno' }).waitFor()
  const card = page.locator('.notebook-card').first()
  await card.waitFor()
  const cardTitle = await card.locator('.notebook-title').innerText()
  report.desktop.coverTitle = cardTitle
  report.desktop.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

  await card.click()
  await page.getByText('Domanda del giorno').waitFor()
  await page.getByText(/Che cosa posso lasciar andare stasera/i).waitFor()
  const question = await page.locator('.page-section').first().locator('.section-prompt').innerText()
  report.desktop.question = question

  // Disegna un tratto con la "pencil" via Pointer Events sintetici.
  const before = await page.evaluate(() => {
    const canvas = document.querySelector('.ink-layer')
    return canvas.toDataURL()
  })
  await page.evaluate(() => {
    const canvas = document.querySelector('.ink-layer')
    const rect = canvas.getBoundingClientRect()
    const opts = (x, y, type) => new PointerEvent(type, {
      pointerId: 1, pointerType: 'pen', isPrimary: true, bubbles: true,
      clientX: rect.left + x, clientY: rect.top + y,
      pressure: 0.9, tiltX: 0, tiltY: 5,
    })
    canvas.dispatchEvent(opts(120, 150, 'pointerdown'))
    for (let i = 1; i <= 10; i += 1) {
      canvas.dispatchEvent(opts(120 + i * 14, 150 + i * 8, 'pointermove'))
    }
    canvas.dispatchEvent(opts(260, 230, 'pointerup'))
  })
  await page.waitForTimeout(350)
  const after = await page.evaluate(() => {
    const canvas = document.querySelector('.ink-layer')
    return canvas.toDataURL()
  })
  report.desktop.inkDrawn = before !== after
  await page.screenshot({ path: new URL('quaderno-page.png', artifacts).pathname, fullPage: true })

  // Undo: il tratto deve sparire.
  await page.keyboard.press('Control+z')
  await page.waitForTimeout(300)
  const afterUndo = await page.evaluate(() => {
    const canvas = document.querySelector('.ink-layer')
    return canvas.toDataURL()
  })
  report.desktop.undoWorks = before === afterUndo

  // Il dito NON disegna: un drag touch non deve lasciare tracce.
  const beforeTouch = await page.evaluate(() => document.querySelector('.ink-layer').toDataURL())
  await page.evaluate(() => {
    const canvas = document.querySelector('.ink-layer')
    const rect = canvas.getBoundingClientRect()
    const opts = (x, y, type) => new PointerEvent(type, {
      pointerId: 10, pointerType: 'touch', isPrimary: true, bubbles: true,
      clientX: rect.left + x, clientY: rect.top + y, pressure: 0.5,
    })
    canvas.dispatchEvent(opts(80, 80, 'pointerdown'))
    for (let i = 1; i <= 8; i += 1) {
      canvas.dispatchEvent(opts(80 + i * 16, 80 + i * 10, 'pointermove'))
    }
    canvas.dispatchEvent(opts(208, 160, 'pointerup'))
  })
  await page.waitForTimeout(300)
  const afterTouch = await page.evaluate(() => document.querySelector('.ink-layer').toDataURL())
  report.desktop.touchBlocked = beforeTouch === afterTouch

  // Doppio tap della penna: due tocchetti rapidi → si passa a gomma, poi di nuovo a penna.
  async function penTap(pointerId, x, y) {
    await page.evaluate(({ pointerId, x, y }) => {
      const canvas = document.querySelector('.ink-layer')
      const rect = canvas.getBoundingClientRect()
      const opts = (type) => new PointerEvent(type, {
        pointerId, pointerType: 'pen', isPrimary: true, bubbles: true,
        clientX: rect.left + x, clientY: rect.top + y, pressure: 0.9,
      })
      canvas.dispatchEvent(opts('pointerdown'))
      canvas.dispatchEvent(opts('pointerup'))
    }, { pointerId, x, y })
  }
  await penTap(21, 300, 150)
  await penTap(22, 300, 150)
  await page.waitForTimeout(400)
  report.desktop.doubleTapEraser = await page.locator('.tool-button[aria-label="Gomma"]').evaluate(
    (element) => element.classList.contains('active'),
  )
  report.desktop.doubleTapClean = before === await page.evaluate(() => document.querySelector('.ink-layer').toDataURL())
  await penTap(23, 300, 150)
  await penTap(24, 300, 150)
  await page.waitForTimeout(400)
  report.desktop.doubleTapPen = await page.locator('.tool-button[aria-label="Penna"]').evaluate(
    (element) => element.classList.contains('active'),
  )

  // PWA manifest e icone.
  report.pwa = await page.evaluate(async () => {
    const manifest = await (await fetch('manifest.webmanifest')).json()
    const iconStatuses = []
    for (const icon of manifest.icons) {
      const response = await fetch(icon.src)
      iconStatuses.push({ src: icon.src, status: response.status })
    }
    return { startURL: manifest.start_url, scope: manifest.scope, iconStatuses }
  })

  // Mobile (emulazione iPad).
  const mobile = await browser.newPage({
    viewport: { width: 834, height: 1112 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  })
  mobile.on('console', (msg) => {
    if (msg.type() === 'error') report.consoleErrors.push(`mobile: ${msg.text()}`)
  })
  await mobile.goto(baseURL, { waitUntil: 'networkidle' })
  await mobile.locator('.notebook-card').first().click()
  await mobile.getByText('Domanda del giorno').waitFor()
  report.mobile.overflowX = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  report.mobile.canvasVisible = await mobile.locator('.ink-layer').first().isVisible()
  report.mobile.toolbarVisible = await mobile.locator('.page-toolbar').isVisible()
  await mobile.screenshot({ path: new URL('quaderno-mobile.png', artifacts).pathname, fullPage: true })

  // Offline: service worker + reload.
  await page.reload({ waitUntil: 'networkidle' })
  report.offline.serviceWorkerReady = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    return Boolean(registration?.active)
  })
  const context = page.context()
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  report.offline.reloadWorked = (await page.locator('.notebook-card').first().count()) > 0
  await context.setOffline(false)

  await browser.close()
} catch (error) {
  console.error('E2E FAILED:', error.message)
  process.exit(1)
} finally {
  preview.kill()
}

const failed =
  report.consoleErrors.length > 0 ||
  report.desktop.overflowX > 1 ||
  report.mobile.overflowX > 1 ||
  !report.desktop.inkDrawn ||
  !report.desktop.undoWorks ||
  !report.desktop.touchBlocked ||
  !report.desktop.doubleTapEraser ||
  !report.desktop.doubleTapClean ||
  !report.desktop.doubleTapPen ||
  !report.offline.reloadWorked ||
  report.pwa?.iconStatuses?.some((asset) => asset.status !== 200)

console.log(JSON.stringify(report, null, 2))
if (failed) {
  console.error('SMOKE FAILED')
  process.exit(1)
}
console.log('SMOKE OK')
