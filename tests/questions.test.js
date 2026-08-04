import { describe, expect, it } from 'vitest'
import { QUESTIONS, QUESTION_THEMES, getQuestionOfDay, questionForDate, themeCounts, CLOSING_QUESTION, MICROSTEP_PROMPT } from '../src/data/questions.js'

describe('question library', () => {
  it('has at least 24 questions across all themes', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(24)
    const themes = new Set(QUESTIONS.map((q) => q.theme))
    for (const theme of QUESTION_THEMES) expect(themes.has(theme)).toBe(true)
  })

  it('returns the same question for the same date (One Line a Day)', () => {
    expect(getQuestionOfDay('2026-08-04')).toEqual(getQuestionOfDay('2026-08-04'))
    expect(getQuestionOfDay('2026-08-04')).not.toEqual(getQuestionOfDay('2026-08-05'))
  })

  it('wraps around the library deterministically', () => {
    const first = getQuestionOfDay('2026-01-01')
    const later = getQuestionOfDay('2026-01-01')
    expect(first).toEqual(later)
  })

  it('attaches the date to a question', () => {
    const q = questionForDate('2026-08-04')
    expect(q.date).toBe('2026-08-04')
    expect(q.text).toBeTruthy()
  })

  it('counts questions per theme', () => {
    const counts = themeCounts()
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
    expect(total).toBe(QUESTIONS.length)
  })

  it('uses the user closing ritual and micro-step phrasing', () => {
    expect(CLOSING_QUESTION).toContain('lasciare non risolto')
    expect(MICROSTEP_PROMPT).toContain('dipende da me')
  })
})
