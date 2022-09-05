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
import React from 'react';
import styles from './index.less';
import './index.less';

interface Props {
  content: string
}

function CodeEditor(props: Props) {
  // 自定义mode，对日期、构建步骤和一些关键词设定样式，codemirror规定样式名必须为cm-{token}
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
      { regex: /\[deploy : deploy\]/, token: 'background-purple' },
      { regex: /\[\d{4}-\d{2}-\d{2} \d{1,2}:\d{1,2}:\d{1,2}\]/, token: 'yellow' }, // 构建日志的日期格式：[2021-11-12 02:16:48]
      { regex: /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\]/, token: 'yellow' }, // stdout的日期格式：[2021-11-12T02:16:48Z]
      { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/, token: 'yellow' }, // stdout的用户日期格式：2021-11-12T10:16:48+08:00
      { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/, token: 'yellow' }, // stdout的用户日期格式：2021-11-12T10:16:48+08:00
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
      className={styles.myCodeMirror}
      value={
      props.content
    }
    // 首次滚动
      editorDidMount={(editor) => {
        editor.execCommand('goDocEnd');
      }}
    // 数据变化时滚动
      onChange={(editor) => {
        editor.execCommand('goDocEnd');
      }}
      options={{
        mode: 'horizon',
        theme: 'material',
        lineWrapping: true,
        lineNumbers: false, // todo(sph): 显示行号偶现卡顿问题待确认
        readOnly: true,
      }}
    />
  );
}

export default React.memo(CodeEditor);
