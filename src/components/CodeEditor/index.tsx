import {UnControlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
// import 'codemirror/addon/selection/active-line';
// import 'codemirror/addon/display/fullscreen'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import './index.less'

interface Props {
  content: string
}

export default (props: Props) => {
  return <CodeMirror
    value={
      props.content
    }
    // 首次滚动
    editorDidMount={(editor) => {
      editor.execCommand('goDocEnd')
    }}
    // 数据变化时滚动
    onChange={(editor) => {
      editor.execCommand('goDocEnd')
    }}
    options={{
      mode: 'text/x-mysql',
      theme: 'material',
      lineWrapping: true,
      lineNumbers: false,   // todo(sph): 显示行号偶现卡顿问题待确认
      readOnly: true,
    }}
  />
}

