// Export PDF minimale senza dipendenze: canvas → JPEG → PDF con immagine incorporata.
// Funziona offline ed evita ~500 KB di libreria (jsPDF).

export const A4 = { width: 595.28, height: 841.89 }

export function exportCanvasAsPdf(canvas, filename = 'pagina.pdf', { margin = 24 } = {}) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Export non riuscito'))
        return
      }
      const jpegBase64 = await blobToBase64(blob)
      try {
        const bytes = buildPdf(jpegBase64, canvas.width, canvas.height, margin)
        downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename)
        resolve(filename)
      } catch (error) {
        reject(error)
      }
    }, 'image/jpeg', 0.92)
  })
}

function base64DecodedLength(base64) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}

export function buildPdf(jpegBase64, imageW, imageH, margin = 24) {
  const contentW = A4.width - margin * 2
  const contentH = A4.height - margin * 2
  const scale = Math.min(contentW / imageW, contentH / imageH)
  const drawW = round2(imageW * scale)
  const drawH = round2(imageH * scale)
  const x = round2((A4.width - drawW) / 2)
  const y = round2((A4.height - drawH) / 2)

  const imageLength = base64DecodedLength(jpegBase64)
  const content = `q\n${drawW} 0 0 ${drawH} ${x} ${y} cm\n/Im0 Do\nQ`
  const catalog = '<< /Type /Catalog /Pages 2 0 R >>'
  const pages = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  const page = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>'
  const image = `<< /Type /XObject /Subtype /Image /Width ${imageW} /Height ${imageH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageLength} >>`
  const contentObj = `<< /Length ${content.length} >>`

  const sections = [
    `1 0 obj\n${catalog}\nendobj`,
    `2 0 obj\n${pages}\nendobj`,
    `3 0 obj\n${page}\nendobj`,
    `4 0 obj\n${image}\nstream\n${jpegBase64}\nendstream\nendobj`,
    `5 0 obj\n${contentObj}\nstream\n${content}\nendstream\nendobj`,
  ]

  const lines = ['%PDF-1.4']
  const offsets = [0]
  for (const section of sections) {
    offsets.push(lines.join('\n').length + 1)
    lines.push(section)
  }
  const xrefStart = lines.join('\n').length + 1
  lines.push('xref')
  lines.push(`0 ${sections.length + 1}`)
  lines.push('0000000000 65535 f ')
  for (let i = 1; i <= sections.length; i += 1) {
    lines.push(`${String(offsets[i]).padStart(10, '0')} 00000 n `)
  }
  lines.push('trailer')
  lines.push(`<< /Size ${sections.length + 1} /Root 1 0 R >>`)
  lines.push('startxref')
  lines.push(String(xrefStart))
  lines.push('%%EOF')
  return new TextEncoder().encode(lines.join('\n'))
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function isValidPdfHeader(bytes) {
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
}
