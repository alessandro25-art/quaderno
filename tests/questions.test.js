import { describe, expect, it } from 'vitest'
import {
  QUESTIONS, VISUAL_QUESTIONS, WEEKLY_VISUAL, QUESTION_POOLS, WEEKLY_TECHNIQUES,
  getQuestionOfDay, getVisualizationOfDay, techniqueForDate, getDailyStructure, themeCounts,
  CLOSING_QUESTION, MICROSTEP_PROMPT,
} from '../src/data/questions.js'

describe('question library', () => {
  it('has 7 weekly techniques and at least 24 reflective questions', () => {
    expect(WEEKLY_TECHNIQUES).toHaveLength(7)
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(24)
    for (const [key, pool] of Object.entries(QUESTION_POOLS)) {
      expect(pool.length, `pool ${key}`).toBeGreaterThanOrEqual(4)
    }
  })

  it('has at least 8 visualization questions, one pair per weekday', () => {
    expect(VISUAL_QUESTIONS.length).toBeGreaterThanOrEqual(8)
    expect(Object.keys(WEEKLY_VISUAL)).toHaveLength(7)
    for (const q of VISUAL_QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(20)
    }
  })

  it('rotates the technique by weekday: Monday is gratitude, Sunday is gentle review', () => {
    expect(techniqueForDate('2026-08-03').key).toBe('gratitudine') // lunedì
    expect(techniqueForDate('2026-08-09').key).toBe('revisione')   // domenica
    expect(techniqueForDate('2026-08-08').key).toBe('osservazione') // sabato
  })

  it('returns the same question for the same date, different for different dates', () => {
    expect(getQuestionOfDay('2026-08-04')).toEqual(getQuestionOfDay('2026-08-04'))
    expect(getQuestionOfDay('2026-08-04').text).not.toBe(getQuestionOfDay('2026-08-05').text)
  })

  it('keeps the visualization prompt within the weekday pool', () => {
    const monday = getVisualizationOfDay('2026-08-03')
    expect(WEEKLY_VISUAL[1]).toContain(monday.text)
  })

  it('keeps the question within the weekday technique pool', () => {
    const monday = getQuestionOfDay('2026-08-03')
    expect(QUESTION_POOLS.gratitudine).toContain(monday.text)
    const sunday = getQuestionOfDay('2026-08-09')
    expect(QUESTION_POOLS.revisione).toContain(sunday.text)
  })

  it('builds a daily structure of 5 sections with dedicated spaces', () => {
    const structure = getDailyStructure('2026-08-04')
    expect(structure).toHaveLength(5)
    expect(structure.map((s) => s.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])
    expect(structure[0].size).toBe('medium')
    expect(structure[1].size).toBe('large')
    for (const section of structure.slice(2)) expect(section.size).toBe('small')
    for (const section of structure) expect(section.text.trim().length).toBeGreaterThan(5)
  })

  it('keeps the structure stable per date and includes the closing ritual', () => {
    const a = getDailyStructure('2026-08-04')
    const b = getDailyStructure('2026-08-04')
    expect(a.map((s) => s.text)).toEqual(b.map((s) => s.text))
    expect(a.some((s) => s.text.includes('lasciare non risolto'))).toBe(true)
    expect(a.some((s) => s.text.includes('dipende da me'))).toBe(true)
    expect(a[0].theme).toBe('Concretizzare') // martedì → Watkins
  })

  it('writes grammatically clean prompts', () => {
    const all = [
      ...QUESTIONS.map((q) => q.text),
      ...VISUAL_QUESTIONS.map((q) => q.text),
      CLOSING_QUESTION, MICROSTEP_PROMPT,
    ]
    for (const text of all) {
      expect(text).not.toMatch(/, oggi\?/i)
      expect(text).not.toMatch(/\s{2,}/)
      expect(text.trim()).toBe(text)
      expect(text).toMatch(/^[A-ZÀÈÉÌÒÙ]/)
      expect(text).not.toMatch(/me ne ha data/i)
    }
  })

  it('counts questions per technique pool', () => {
    const counts = themeCounts()
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
    expect(total).toBe(QUESTIONS.length)
  })

  it('uses the user closing ritual and micro-step phrasing', () => {
    expect(CLOSING_QUESTION).toContain('lasciare non risolto')
    expect(MICROSTEP_PROMPT).toContain('dipende da me')
  })
})
