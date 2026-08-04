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

  it('opens the notebook and shows today question + paper + closing ritual', async () => {
    const store = makeStore()
    render(<App store={store} />)
    await userEvent.click(await screen.findByRole('button', { name: /diario/i }))
    await waitFor(() => {
      expect(screen.getByText(/Domanda del giorno/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Che cosa posso lasciar andare stasera/i)).toBeInTheDocument()
    expect(screen.getByText(/Il mio micro-passo per domani/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Visualizzazione/i).length).toBeGreaterThanOrEqual(1)
    // ogni domanda ha il suo spazio di scrittura dedicato (2 canvas per sezione)
    expect(document.querySelectorAll('.page-section')).toHaveLength(5)
    expect(document.querySelectorAll('.ink-layer')).toHaveLength(10)
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
    await screen.findByText(/Domanda del giorno/i)
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
