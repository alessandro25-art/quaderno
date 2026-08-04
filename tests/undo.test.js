import { describe, expect, it } from 'vitest'
import { UndoManager } from '../src/domain/undo.js'

describe('undo manager', () => {
  it('starts empty with no undo/redo', () => {
    const manager = new UndoManager()
    expect(manager.canUndo).toBe(false)
    expect(manager.canRedo).toBe(false)
    expect(manager.undo()).toBeNull()
    expect(manager.redo()).toBeNull()
  })

  it('needs a baseline before undo is possible', () => {
    const manager = new UndoManager()
    manager.push([]) // baseline
    manager.push(['a'])
    expect(manager.canUndo).toBe(true)
    expect(manager.undo()).toEqual([])
    expect(manager.canUndo).toBe(false)
    expect(manager.undo()).toBeNull()
  })

  it('undoes and redoes in order', () => {
    const manager = new UndoManager()
    manager.push([])
    manager.push(['a'])
    manager.push(['a', 'b'])
    manager.push(['a', 'b', 'c'])
    expect(manager.undo()).toEqual(['a', 'b'])
    expect(manager.undo()).toEqual(['a'])
    expect(manager.redo()).toEqual(['a', 'b'])
    expect(manager.redo()).toEqual(['a', 'b', 'c'])
    expect(manager.canRedo).toBe(false)
  })

  it('truncates the redo branch on a new push', () => {
    const manager = new UndoManager()
    manager.push([])
    manager.push(['a'])
    manager.push(['a', 'b'])
    manager.undo()
    manager.push(['x'])
    expect(manager.canRedo).toBe(false)
    expect(manager.redo()).toBeNull()
    expect(manager.undo()).toEqual(['a'])
  })

  it('respects the limit and clears', () => {
    const manager = new UndoManager(2)
    manager.push([])
    manager.push(['a'])
    manager.push(['a', 'b'])
    expect(manager.states).toHaveLength(2)
    manager.clear()
    expect(manager.canUndo).toBe(false)
    expect(manager.canRedo).toBe(false)
  })
})
