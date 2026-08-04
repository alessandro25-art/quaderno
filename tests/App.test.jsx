import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'
import { createJournalStore } from '../src/data/store.js'

function makeStore() {
  return createJournalStore(`app-test-${crypto.randomUUID()}`)
}

describe('quaderno app', () => {
  afterEach(cleanup)

  it('boots and creates the first notebook automatically with kindle paper', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await screen.findByText('Diario')
    const notebooks = await store.listNotebooks()
    expect(notebooks).toHaveLength(1)
    expect(notebooks[0].paperType).toBe('kindle')
  })

  it('opens the notebook and walks through one question per page', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await userEvent.click(await screen.findByRole('button', { name: /diario/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/Domanda del giorno/i).length).toBeGreaterThanOrEqual(1)
    })
    // una sola domanda per pagina, con il suo spazio di scrittura (2 canvas)
    expect(document.querySelectorAll('.page-section')).toHaveLength(1)
    expect(document.querySelectorAll('.ink-layer')).toHaveLength(2)
    // la chiusura non è ancora visibile: si arriva avanzando
    expect(screen.queryByText(/Che cosa posso lasciar andare stasera/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /prossima/i }))
    expect(screen.getAllByText(/Visualizzazione/i).length).toBeGreaterThanOrEqual(1)

    await userEvent.click(screen.getByRole('button', { name: /prossima/i }))
    expect(screen.getByText(/Il mio micro-passo per domani/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /prossima/i }))
    expect(screen.getByText(/Che cosa posso lasciar andare stasera/i)).toBeInTheDocument()

    // ultima domanda → il pulsante diventa "✓ Fine"
    await userEvent.click(screen.getByRole('button', { name: /prossima/i }))
    await userEvent.click(screen.getByRole('button', { name: '✓ Fine' }))
    expect(screen.getByText(/Buonanotte/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Domanda del giorno/i).length).toBeGreaterThanOrEqual(1)
  })

  it('creates a custom notebook from the cover', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await screen.findByText('Diario')
    await userEvent.click(screen.getByRole('button', { name: /nuovo quaderno/i }))
    await userEvent.type(screen.getByLabelText('Titolo del quaderno'), 'Grazie')
    await userEvent.click(screen.getByRole('button', { name: 'Crea quaderno' }))
    expect(await store.listNotebooks()).toHaveLength(2)
    expect((await store.listNotebooks()).map((nb) => nb.title)).toContain('Grazie')
  })

  it('navigates between days and persists the page per date', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await userEvent.click(await screen.findByRole('button', { name: /diario/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/Domanda del giorno/i).length).toBeGreaterThanOrEqual(1)
    })
    await userEvent.click(screen.getByRole('button', { name: 'Giorno precedente' }))
    const pages = await store.listPages((await store.listNotebooks())[0].id)
    expect(pages.length).toBeGreaterThanOrEqual(2)
  })

  it('exposes settings with backup and OCR key placeholder', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await userEvent.click(await screen.findByRole('button', { name: /diario/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Impostazioni' }))
    expect(await screen.findByRole('button', { name: 'Esporta backup' })).toBeInTheDocument()
    expect(screen.getByLabelText('API key per il riconoscimento')).toBeInTheDocument()
    expect(screen.getByText(/PencilKit/i)).toBeInTheDocument()
  })
})
