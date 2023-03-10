/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import Expression from './Expression';

export default class BaseResultProcessing {
  process<T>(data: T[], parsedResult: Expression[]): T[] {
    return _.filter(data, (f) => this.predicate(f, parsedResult));
  }

  predicateSingle(item: any, parsedResult: Expression) {
    return this.filter(item, parsedResult.category, parsedResult.operator, parsedResult.value);
  }

  predicate(item: any, parsedResult: Expression | Expression[]): boolean {
    let expressions: Expression[] = [];
    if (_.isArray(parsedResult)) {
      expressions = parsedResult;
    } else if (_.isArray(parsedResult.expressions)) {
      expressions = parsedResult.expressions;
    } else {
      return this.predicateSingle(item, parsedResult);
    }

    let result: boolean = true;

    expressions.forEach((f) => {
      if (_.isUndefined(f.conditionType)) {
        result = this.predicate(item, f);
      } else

      if (f.conditionType.toLowerCase() === 'and') {
        result = result && this.predicate(item, f);
      } else
      if (f.conditionType.toLowerCase() === 'or') {
        result = result || this.predicate(item, f);
      }
    });

    return result;
  }

  filter(row: any, field: string | undefined, operator: string | undefined, value: string | undefined) {
    return true;
  }
}
