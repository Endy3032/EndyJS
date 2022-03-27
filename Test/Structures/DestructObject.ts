class DestructObject {
  private _raw: {}
  constructor(message = {}, removeFields = {}) {
    this._raw = message
    this.destructObject(message, removeFields)
  }
  destructObject(message: { [s: string]: unknown } | ArrayLike<unknown>, removeFields: { [x: string]: any }) {
    for (const [key, value] of Object.entries(message)) {
      if (!removeFields[key]) {
        this[key] = value
      } else {
        this[`_${key}`] = value
      }
    }
    return this
  }

  toJSON() {
    return { ...this }
  }
}
export = DestructObject
