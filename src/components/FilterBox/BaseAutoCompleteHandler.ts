/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import lodash from 'lodash';
import PEG from 'pegjs';

import { HintInfo } from './models/ExtendedCodeMirror';
import ParseTrace from './ParseTrace';

export default class BaseAutoCompleteHandler {
  quote(text: string) {
    if (/\s/g.test(text)) {
      return `"${text}"`;
    }

    return text;
  }

  buildDefaultObjOrGetOriginal(value: string | Object, type: string): HintInfo {
    if (lodash.isString(value)) {
      return {
        value: this.quote(value),
        type,
      };
    }

    return {
      value,
      type,
    };
  }

  handleParseError(parseTrace: ParseTrace, error: PEG.PegjsError): HintInfo[] {
    const trace = parseTrace;
    const result = lodash.flatMap(error.expected, (f: PEG.ExpectedItem) => {
      const result: HintInfo[] = [];
      // if (f.type === 'literal') {
      //   result = lodash.map([(f as any).text || f.value], (f) => ({ value: f, type: 'literal' }));
      // }

      if (f.type === 'other') {
        return this.next(trace);
      }

      return result;
    });
    const m = new Map();
    return result.filter((h) => {
      if (m.has(h.value)) {
        return false;
      }
      m.set(h.value, null);
      return true;
    });
  }

  next(trace: ParseTrace) {
    let result: HintInfo[] = [];
    const lastTokenType = trace.getLastTokenType() || 'value';

    if (lastTokenType === 'value') {
      result = lodash.map(this.needCategories(trace), (f) => this.buildDefaultObjOrGetOriginal(f, 'category'));
      const m: Set<string | Object> = new Set();
      trace.arr.filter((o) => o.type === 'category').map((o) => m.add(o.value));
      result = result.filter((o) => !m.has(o.value));
    }

    if (lastTokenType === 'category') {
      result = lodash.map(this.needOperators(trace.getLastCategory(), trace), (f) => this.buildDefaultObjOrGetOriginal(f, 'operator'));
    }

    if (lastTokenType === 'operator') {
      result = lodash.map(this.needValues(trace.getLastCategory(), trace.getLastOperator(), trace), (f) => this.buildDefaultObjOrGetOriginal(f, 'value'));
    }

    return result;
  }

  hasCategory(category: string): boolean {
    return false;
  }

  hasOperator(category: string, operator: string): boolean {
    return false;
  }

  needCategories(trace: ParseTrace): string[] {
    return [];
  }

  needOperators(lastOperator: string, trace: ParseTrace): string[] {
    return [];
  }

  needValues(lastCategory: string, lastOperator: string, trace: ParseTrace): string[] {
    return [];
  }
}
