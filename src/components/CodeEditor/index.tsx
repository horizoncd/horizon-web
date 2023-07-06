import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/mode/simple.js';
// import 'codemirror/addon/selection/active-line';
// import 'codemirror/addon/display/fullscreen'
// import 'codemirror/mode/sql/sql'
// import 'codemirror/addon/hint/show-hint.css'
// @ts-ignore
import CodeMirror from 'codemirror';
import './index.less';
import React from 'react';
import styles from './index.less';

interface Props {
  content: string
}

function CodeEditor(props: Props) {
  const { content } = props;

  CodeMirror.defineSimpleMode('horizon', {
    // The start state contains the rules that are intially used
    start: [
      // The regex matches the token, the token property contains the type
      //Trying to define keywords here
      { regex: /INFO|info/, token: 'sky-blue' },
      { regex: /WARN|warn/, token: 'yellow' },
      { regex: /DEBUG|debug/, token: 'purple' },
      { regex: /ERROR|error/, token: 'red' },
      { regex: /SUCCESS|SUCCESSFUL|success|successful|BUILD SUCCESSFUL|BUILD SUCCESS|deploy success/, token: 'green' },
      { regex: /\[build : git\]/, token: 'background-green' },
      { regex: /\[build : compile\]/, token: 'background-sky-blue' },
      { regex: /\[build : image\]/, token: 'background-yellow' },
      { regex: /\[check : check\]/, token: 'background-violet' },
      { regex: /\[deploy : deploy\]/, token: 'background-purple' },
      { regex: /\[\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}\]/, token: 'yellow' },
      { regex: /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\]/, token: 'yellow' }, // [2021-11-12T02:16:48Z]
      { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/, token: 'yellow' }, // 2021-11-12T10:16:48+08:00
      { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/, token: 'yellow' }, // 2021-11-12T10:16:48+08:00
    ],
    // The multi-line comment state.
    comment: [],
    meta: {
      dontIndentStates: ['comment'],
      lineComment: ';',
    },
  });

  return (
    <ReactCodeMirror
      autoScroll={false}
      className={styles.myCodeMirror}
      value={content}
      editorDidMount={(editor) => {
        editor.execCommand('goDocEnd');
      }}
      onChange={(editor) => {
        editor.execCommand('goDocEnd');
      }}
      options={{
        mode: 'horizon',
        theme: 'material',
        lineWrapping: true,
        lineNumbers: false,
        readOnly: true,
      }}
    />
  );
}

export default React.memo(CodeEditor);
