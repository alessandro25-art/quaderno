import { useEffect, useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns'
import { it } from 'date-fns/locale'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ArchiveView({ store, notebook, onBack, onOpenDay }) {
  const [month, setMonth] = useState(() => new Date())
  const [pages, setPages] = useState([])

  useEffect(() => {
    let active = true
    store.listPages(notebook.id).then((all) => {
      if (active) setPages(all)
    })
    return () => { active = false }
  }, [store, notebook.id])

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const byDate = useMemo(() => {
    const map = {}
    for (const page of pages) map[page.date] = page
    return map
  }, [pages])

  const firstWeekday = startOfMonth(month).getDay() // 0 = domenica
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
      </header>

      <div className="calendar-card">
        <div className="calendar-head">
          <button className="ghost-button" type="button" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mese precedente"><ChevronLeft size={18} /></button>
          <h2>{format(month, 'MMMM yyyy', { locale: it })}</h2>
          <button className="ghost-button" type="button" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Mese successivo"><ChevronRight size={18} /></button>
        </div>

        <div className="calendar-weekdays">
          {weekdayLabels.map((label, index) => <span key={index}>{label}</span>)}
        </div>

        <div className="calendar-grid" style={{ '--offset': firstWeekday }}>
          {days.map((day) => {
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
