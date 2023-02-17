import lodash from 'lodash';

export default class ParseTrace {
  arr: Array<TraceItem> = [];

  constructor() {
    this.arr = [];
  }

  push(item: TraceItem) {
    this.arr.push(item);
  }

  clear() {
    this.arr = [];
  }

  getLastOperator() {
    return lodash.findLast(this.arr, (f) => f.type === 'operator').value;
  }

  getLastCategory() {
    return lodash.findLast(this.arr, (f) => f.type === 'category').value;
  }

  getLastTokenType() {
    if (this.arr.length <= 0) return null;
    return lodash.last(this.arr).type;
  }

  pushOperator(operator: string) {
    this.push({ type: 'operator', value: operator });
  }

  pushCategory(category: string) {
    this.push({ type: 'category', value: category });
  }

  pushValue(value: string) {
    this.push({ type: 'value', value });
  }
}

interface TraceItem {
  type: 'operator' | 'category' | 'value' | 'search';
  value: string;
}
