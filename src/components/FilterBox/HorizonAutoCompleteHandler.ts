/* eslint-disable @typescript-eslint/no-unused-vars */
import ParseTrace from '@/components/FilterBox/ParseTrace';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';

export default class HorizonAutoCompleteHandler extends BaseAutoCompleteHandler {
  categories: string[];

  readonly options: AutoCompleteOption[];

  constructor(options: AutoCompleteOption[]) {
    super();

    this.categories = options.map((o) => o.key);
    this.options = options;
  }

  hasCategory(category: string): boolean {
    return category in this.categories;
  }

  hasOperator(category: string, operator: string): boolean {
    const operators = this.needOperators(category);
    return operator in operators;
  }

  needCategories(trace: ParseTrace) {
    return this.categories;
  }

  needOperators(parsedCategory: string, trace: ParseTrace) {
    return this.options.filter((c) => c.key === parsedCategory).flatMap((o) => o.values.map((v) => v.operator));
  }

  needValues(parsedCategory: string, parsedOperator: string, trace: ParseTrace): any[] {
    const cates = this.options.filter((o) => o.key === parsedCategory && o.type === 'selection');
    if (cates.length === 0) {
      return [];
    }
    const category = cates[0];
    if (category.callback) {
      return category.callback(parsedOperator, trace);
    }

    const values = cates.flatMap((o) => o.values)
      .filter((v) => v.operator === parsedOperator).flatMap((v) => v.possibleValues);
    return values;
  }
}

export interface AutoCompleteOption {
  key: string,
  values: Value[],
  type: 'text' | 'selection';
  callback?: (operator: string, trace: ParseTrace) => string[]
}

export interface Value {
  operator: string
  possibleValues: string[]
}
