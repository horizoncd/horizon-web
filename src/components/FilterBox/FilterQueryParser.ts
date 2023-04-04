/* eslint-disable no-param-reassign */
import PEG from 'pegjs';
import lodash from 'lodash';
import { parse, SyntaxError } from './grammar.js';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
import ParseTrace from './ParseTrace';
import grammarUtils from './GrammarUtils';
import { HintInfo } from './models/ExtendedCodeMirror';
import Expression from './Expression';
import ParsedError from './ParsedError';

export interface ExtendedParser extends PEG.Parser {
}

const parser: ExtendedParser = { parse, SyntaxError };

export default class FilterQueryParser {
  autoCompleteHandler;

  parseTrace;

  constructor() {
    this.autoCompleteHandler = new BaseAutoCompleteHandler();
    this.parseTrace = new ParseTrace();
  }

  parse(query: string): Expression[] | ParsedError {
    query = lodash.trim(query);
    if (lodash.isEmpty(query)) {
      return [];
    }

    try {
      return this.parseQuery(query);
    } catch (ex: any) {
      ex.isError = true;
      return ex;
    }
  }

  private parseQuery(query: string): Expression[] {
    this.parseTrace.clear();
    return parser.parse(query, { parseTrace: this.parseTrace });
  }

  getSuggestions(query: string): HintInfo[] {
    query = grammarUtils.stripEndWithNonSeparatorCharacters(query);
    let result = [];
    try {
      this.parseQuery(query);
      // if (!query || grammarUtils.isLastCharacterWhiteSpace(query)) {
      //   return lodash.map(['AND', 'OR'], (f) => ({ value: f, type: 'literal' }));
      // }
      result = this.autoCompleteHandler.next(this.parseTrace);
    } catch (ex: any) {
      result = this.autoCompleteHandler.handleParseError(this.parseTrace, ex);
    }
    return result;
  }

  setAutoCompleteHandler(autoCompleteHandler: BaseAutoCompleteHandler) {
    this.autoCompleteHandler = autoCompleteHandler;
  }
}
