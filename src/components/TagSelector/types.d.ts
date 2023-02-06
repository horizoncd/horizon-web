export interface Operator {
  value: string,
  description: string,
}

export interface Option {
  value: string,
  title: string,
}

export interface Token {
  type: string,
  title: string,
  operators: Operator[],
  options: Option[],
}

export interface SelectedToken {
  token: Token,
  operator?: Operator,
  option?: Option,
}

interface Item {
  disabled?: boolean,
  key: string,
  name: string,
  prefix?: string,
  disableMarkIt?: boolean,
}

interface SuggestionProps {
  // classNames: Record<string, string>,
  query?: string,
  onClick: (i: Item) => void,
  // index: number,
  id: string,
  options: Item[],
  expand?: bool
}
