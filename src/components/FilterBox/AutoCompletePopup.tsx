/* eslint-disable no-param-reassign */
import CodeMirror from 'codemirror';
import lodash from 'lodash';
import ReactDOM from 'react-dom';
import React from 'react';
import {
  HintResult, HintFunc, HintOptions, ExtendedCodeMirror, Completion, HintInfo,
} from './models/ExtendedCodeMirror';
import grammarUtils from './GrammarUtils';

export default class AutoCompletePopup {
  doc: CodeMirror.Doc;

  hintOptions: HintOptions;

  completionShow = false;

  appendSpace = true;

  //@ts-ignore
  customRenderCompletionItem: (self: HintResult, data: Completion, registerAndGetPickFunc: () => PickFunc) => React.ReactElement<any>;

  //@ts-ignore
  pick: (cm: ExtendedCodeMirror, self: HintResult, data: Completion) => string;

  constructor(private cm: ExtendedCodeMirror, private needAutoCompletevalues: (text: string) => HintInfo[]) {
    this.doc = cm.getDoc();

    cm.on('endCompletion', () => {
      this.completionShow = false;
    });

    this.hintOptions = this.createHintOption();
  }

  private processText(value: string | Object): any | Object {
    if (!lodash.isString(value)) {
      return value;
    }
    if (grammarUtils.needSpaceAfter(value as string)) {
      return `${value} `;
    }

    return value;
  }

  private onPick(cm: ExtendedCodeMirror, self: HintResult, data: Completion) {
    let { value } = data;
    if (this.pick) {
      value = this.pick(cm, self, data);
    }

    if (typeof value !== 'string') {
      return;
    }

    cm.replaceRange(this.processText(value), self.from, self.to, 'complete');
  }

  private renderHintElement(element: any, self: HintResult, data: Completion) {
    const div = document.createElement('div');
    const className = ` hint-value cm-${data.type}`;
    const registerAndGetPickFunc = () => {
      //hack with show-hint code mirror https://github.com/codemirror/CodeMirror/blob/master/addon/hint/show-hint.js
      // to prevent handling click event
      element.className += ' custom';
      setTimeout(() => {
        element.hintId = null;
      }, 0);

      return this.manualPick.bind(this, self, data);
    };

    if (this.customRenderCompletionItem) {
      ReactDOM.render(this.customRenderCompletionItem(self, data, registerAndGetPickFunc), div);
    } else {
      ReactDOM.render(<div className={className}>{data.value}</div>, div);
    }

    element.appendChild(div);
  }

  private manualPick(self: HintResult, data: Completion, value: string) {
    const completionControl = this.cm.state.completionActive;
    if (completionControl == null) return;

    const index = self.list.indexOf(data);
    // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-unused-vars
    data.hint = (cm: ExtendedCodeMirror, res: HintResult, data: Completion) => {
      cm.replaceRange(this.processText(value), res.from, res.to, 'complete');
    };
    completionControl.pick(self, index);
  }

  private buildComletionObj(info: HintInfo): Completion {
    return {
      value: info.value,
      type: info.type,
      hint: this.onPick.bind(this),
      render: this.renderHintElement.bind(this),
    };
  }

  private findLastSeparatorPositionWithEditor() {
    const doc = this.cm.getDoc();
    const currentCursor = doc.getCursor();
    const text = doc.getRange({ line: 0, ch: 0 }, currentCursor);
    const index = grammarUtils.findLastSeparatorIndex(text);
    return {
      line: currentCursor.line,
      ch: currentCursor.ch - (text.length - index) + 1,
    };
  }

  show() {
    const cursor = this.doc.getCursor();
    const text = this.doc.getRange({ line: 0, ch: 0 }, cursor);
    this.hintOptions.hintValues = this.needAutoCompletevalues(text);

    this.cm.showHint(this.hintOptions);
    this.completionShow = true;
  }

  private createHintOption() {
    const hintOptions = new HintOptions();

    hintOptions.hint = (() => {
      const { hintValues } = hintOptions;
      const doc = this.cm.getDoc();
      const cursor = doc.getCursor();
      const lastSeparatorPos = this.findLastSeparatorPositionWithEditor();
      const text = doc.getRange(lastSeparatorPos, cursor);

      let values = hintValues;
      if (text) {
        values = lodash.filter(hintValues, (f) => {
          const value = f.value as string;
          return lodash.isString(f.value) ? lodash.startsWith(value.toLowerCase(), text.toLowerCase()) : true;
        });
      }

      return {
        list: lodash.map(values, (c) => this.buildComletionObj(c)),
        from: lastSeparatorPos,
        to: cursor,
      };
    }) as HintFunc;

    hintOptions.hint.supportsSelection = true;

    return hintOptions;
  }
}

interface PickFunc {
  (): void;
}
