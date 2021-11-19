import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

export default (props: { diff: string }) => {
  return <div dangerouslySetInnerHTML={{
    __html: Diff2Html.html(props.diff, {
      drawFileList: true,
      matching: 'lines',
      outputFormat: 'side-by-side',
    })
  }}/>
}
