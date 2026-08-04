// Stack undo/redo a snapshot: salva gli stati dopo ogni modifica, con baseline iniziale.

export class UndoManager {
  constructor(limit = 50) {
    this.limit = limit
    this.states = []
    this.pointer = -1
  }

  get canUndo() {
    return this.pointer > 0
  }

  get canRedo() {
    return this.pointer < this.states.length - 1
  }

  /** Registra un nuovo stato (dopo la modifica). */
  push(state) {
    this.states = this.states.slice(0, this.pointer + 1)
    this.states.push(state)
    if (this.states.length > this.limit) this.states.shift()
    this.pointer = this.states.length - 1
  }

  /** Ritorna lo stato precedente o null. */
  undo() {
    if (!this.canUndo) return null
    this.pointer -= 1
    return this.states[this.pointer]
  }

  /** Ritorna lo stato successivo o null. */
  redo() {
    if (!this.canRedo) return null
    this.pointer += 1
    return this.states[this.pointer]
  }

  clear() {
    this.states = []
    this.pointer = -1
  }
}
