import { useEffect, useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, parseISO, subYears } from 'date-fns'
import { it } from 'date-fns/locale'
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, ScrollText } from 'lucide-react'
import { techniqueForDate } from '../data/questions.js'

const TECHNIQUE_ORDER = ['gratitudine', 'concreto', 'distanza', 'rilettura', 'savoring', 'osservazione', 'revisione']
const TECHNIQUE_LABELS = {
  gratitudine: 'Gratitudine',
  concreto: 'Concretizzare',
  distanza: 'Distanza',
  rilettura: 'Rileggere',
  savoring: 'Savoring',
  osservazione: 'Osservare',
  revisione: 'Revisione',
}

export default function ArchiveView({ store, notebook, onBack, onOpenDay, onOpenSettings }) {
  const [month, setMonth] = useState(() => new Date())
  const [pages, setPages] = useState([])
  const [techniqueFilter, setTechniqueFilter] = useState('all')

  useEffect(() => {
    let active = true
    store.listPages(notebook.id).then((all) => {
      if (!active) return
      setPages(all)
      // Default: mese dell'ultima pagina scritta, non il mese corrente.
      if (all.length > 0) {
        setMonth((current) => current ?? startOfMonth(parseISO(all[all.length - 1].date)))
      }
    })
    return () => { active = false }
  }, [store, notebook.id])

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  // Filtro per tecnica: la tecnica del giorno è deterministica dalla data.
  const visibleDays = useMemo(() => {
    if (techniqueFilter === 'all') return days
    return days.filter((day) => techniqueForDate(format(day, 'yyyy-MM-dd')).key === techniqueFilter)
  }, [days, techniqueFilter])

  const byDate = useMemo(() => {
    const map = {}
    for (const page of pages) map[page.date] = page
    return map
  }, [pages])

  const firstWeekday = startOfMonth(month).getDay() // 0 = domenica

  // «In questo giorno»: giorni del mese con una pagina esattamente un anno prima
  // (subYears gestisce correttamente gli anni bisestili).
  const anniversaries = useMemo(() => {
    const found = []
    for (const day of days) {
      const lastYear = format(subYears(day, 1), 'yyyy-MM-dd')
      if (byDate[lastYear]) found.push({ today: format(day, 'yyyy-MM-dd'), lastYear })
    }
    return found
  }, [days, byDate])

  const weekdayLabels = ['D', 'L', 'M', 'M', 'G', 'V', 'S']
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="archive-view">
      <header className="app-header">
        <button className="ghost-button" type="button" onClick={onBack} aria-label="Torna al quaderno"><ArrowLeft size={18} /></button>
        <div className="header-title">
          <span className="kicker">ARCHIVIO</span>
          <h1>{notebook.title}</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={onOpenSettings} aria-label="Impostazioni"><Settings size={18} /></button>
        </div>
      </header>

      <div className="calendar-card">
        {anniversaries.length > 0 && (
          <div className="anniversary-banner">
            <ScrollText size={16} />
            <span>
              In questo giorno, un anno fa: {format(parseISO(anniversaries[0].lastYear), 'd MMMM yyyy', { locale: it })}
            </span>
            <button className="primary-button" type="button" onClick={() => onOpenDay(anniversaries[0].lastYear)}>
              Rileggi
            </button>
          </div>
        )}
        <div className="calendar-head">
          <button className="ghost-button" type="button" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mese precedente"><ChevronLeft size={18} /></button>
          <h2>{format(month, 'MMMM yyyy', { locale: it })}</h2>
          <button className="ghost-button" type="button" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Mese successivo"><ChevronRight size={18} /></button>
        </div>

        <div className="technique-chips" role="group" aria-label="Filtra per tecnica">
          <button
            type="button"
            className={`tech-chip ${techniqueFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTechniqueFilter('all')}
          >
            Tutte
          </button>
          {TECHNIQUE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`tech-chip ${techniqueFilter === key ? 'active' : ''}`}
              aria-pressed={techniqueFilter === key}
              onClick={() => setTechniqueFilter(key)}
            >
              {TECHNIQUE_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="calendar-weekdays">
          {weekdayLabels.map((label, index) => <span key={index}>{label}</span>)}
        </div>

        <div className="calendar-grid" style={{ '--offset': firstWeekday }}>
          {visibleDays.map((day) => {
            const value = format(day, 'yyyy-MM-dd')
            const page = byDate[value]
            const isToday = value === today
            return (
              <button
                key={value}
                type="button"
                className={`calendar-day ${page ? 'has-page' : ''} ${isToday ? 'today' : ''}`}
                aria-label={`${format(day, 'd MMMM', { locale: it })}${page ? ', pagina scritta' : ''}`}
                onClick={() => page && onOpenDay(page.date)}
                disabled={!page}
              >
                <span>{format(day, 'd')}</span>
                {page && <i aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <p className="calendar-note">
          {pages.length === 0
            ? 'Nessuna pagina ancora: i giorni scritti avranno un puntino.'
            : `${pages.length} pagine scritte. Tocca un giorno per rileggerlo.`}
        </p>
      </div>
    </div>
  )
}
