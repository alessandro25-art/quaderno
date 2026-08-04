import { useState } from 'react'
import { Plus, NotebookPen } from 'lucide-react'

const COVER_COLORS = ['#6b4f3a', '#4a5d3a', '#3a4a5c', '#7a5c3a', '#5c3a4a', '#2c2416']

export default function CoverView({ store, notebooks, onOpen, onChanged }) {
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(COVER_COLORS[0])

  async function createNotebook(event) {
    event.preventDefault()
    const name = title.trim() || 'Diario'
    const now = new Date().toISOString()
    const paperType = (await store.getSetting('paperType')) || 'kindle'
    const notebook = {
      id: crypto.randomUUID(),
      title: name,
      coverColor: color,
      paperType,
      createdAt: now,
      updatedAt: now,
    }
    await store.saveNotebook(notebook)
    setTitle('')
    setCreating(false)
    onChanged()
  }

  return (
    <div className="cover-view">
      <header className="app-header">
        <div className="header-title">
          <span className="kicker">I TUOI QUADERNI</span>
          <h1>Quaderno</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => setCreating((v) => !v)}>
          <Plus size={16} /> Nuovo quaderno
        </button>
      </header>

      {creating && (
        <form className="new-notebook" onSubmit={createNotebook}>
          <label>
            Titolo
            <input
              aria-label="Titolo del quaderno"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="es. Diario, Grazie, Anno 2026…"
              autoFocus
            />
          </label>
          <fieldset>
            <legend>Copertina</legend>
            <div className="cover-colors">
              {COVER_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`cover-color ${color === value ? 'active' : ''}`}
                  aria-label={`Copertina ${value}`}
                  aria-pressed={color === value}
                  onClick={() => setColor(value)}
                  style={{ background: value }}
                />
              ))}
            </div>
          </fieldset>
          <button className="primary-button" type="submit">Crea quaderno</button>
        </form>
      )}

      {notebooks.length === 0 ? (
        <div className="empty-state">
          <NotebookPen size={40} />
          <h2>Non hai ancora quaderni</h2>
          <p>Creane uno: ogni giorno troverai una pagina con la domanda del giorno, spazio libero e il rituale di chiusura.</p>
          <button className="primary-button" type="button" onClick={() => setCreating(true)}>Crea il primo quaderno</button>
        </div>
      ) : (
        <div className="notebook-grid">
          {notebooks.map((notebook) => (
            <button key={notebook.id} type="button" className="notebook-card" onClick={() => onOpen(notebook.id)}>
              <span className="notebook-cover" style={{ background: notebook.coverColor }}>
                <span className="notebook-title">{notebook.title}</span>
              </span>
              <span className="notebook-meta">
                {notebook.updatedAt ? `Modificato il ${new Date(notebook.updatedAt).toLocaleDateString('it-IT')}` : 'Vuoto'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
