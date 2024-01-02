export default class Parser {
  private values: Set<string>
  private quantities: Map<string, number>

  constructor () {
    this.values = new Set()
    this.quantities = new Map()
  }

  add (value: string) {
      if (this.values.has(value)) {
        this.quantities.set(value, this.quantities.get(value)! + 1)
      }
       else {
        this.values.add(value)
        this.quantities.set(value, 1)
      }
  }

  getValues () {
    return this.values
  }

  getQuantities () {
    return this.quantities
  }

  getQuantityOf (value: string) {
    console.log(value)
    console.log(this.quantities.get(value))
    return this.values.has(value) ? this.quantities.get(value) : 0
  }

  getByQuantity (min: number, max: number) {
    const result: string[] = []
    for (const [key, value] of this.quantities) {
      if (value >= min && value <= max) result.push(key)
    }

    return result
  }
}