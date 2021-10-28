import {UnControlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
// import 'codemirror/addon/selection/active-line';
// import 'codemirror/addon/display/fullscreen'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import './index.less'
import 'codemirror/addon/display/fullscreen.css'
import 'codemirror/addon/display/fullscreen'

interface Props {
  content: string
}

export default (props: Props) => {
  return <CodeMirror
    value={props.content}
    options={{
      mode: 'text/x-mysql',
      theme: 'material',
      lineWrapping: true,
      lineNumbers: true,
      readOnly: true,
      // fullScreen: true,
    }}
  />
}

