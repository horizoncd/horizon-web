declare namespace TAG {
  type Tag = {
    key: string
    value: string
  }

  type TagSelector = {
    key: string
    operator: string
    values: string[]
  }
}