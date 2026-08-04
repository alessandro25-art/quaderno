import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'public')

function svg(size) {
  const unit = size / 512
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="86" fill="#f4edda"/>
  <rect x="40" y="40" width="432" height="432" rx="60" fill="none" stroke="#d8cba4" stroke-width="8"/>
  <text x="256" y="250" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${330 * unit}" font-weight="600" fill="#3a2f28">Q</text>
  <line x1="136" y1="318" x2="376" y2="318" stroke="#3a2f28" stroke-width="${14 * unit}" stroke-linecap="round"/>
  <line x1="176" y1="360" x2="336" y2="360" stroke="#8a6f4d" stroke-width="${9 * unit}" stroke-linecap="round"/>
</svg>`
}

const html = (size) => `<!doctype html><html><body style="margin:0">${svg(size)}</body></html>`

const browser = await chromium.launch()
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  await page.setContent(html(size))
  const el = page.locator('svg')
  await el.screenshot({ path: join(outDir, `pwa-${size}.png`), omitBackground: false })
  await page.close()
}
await browser.close()
writeFileSync(join(outDir, 'favicon.svg'), svg(512))
console.log('icons written to', outDir)
