import Terminal, {DEFAULT_CHAR_HEIGHT, DEFAULT_CHAR_WIDTH,} from '@/components/Terminal';
import {useModel} from "@@/plugin-model/useModel";

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;

  const {location} = props;
  const {query} = location;
  const {podName, containerName} = query;

  const backend = window.location.host

  const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  const url = `${protocol}//${backend}/apis/core/v1/clusters/${id}/shell?podName=${podName}&containerName=${containerName}`
  return (
    <Terminal
      url={url}
      onSocketOpen={(socketRef) => {
        if (socketRef.current) {
          socketRef.current.sendMessage(
            JSON.stringify([
              JSON.stringify({
                Op: 'bind',
              }),
            ]),
          );

          socketRef.current.sendMessage(
            JSON.stringify([
              JSON.stringify({
                Op: 'resize',
                Cols: Math.round(
                  document.body.clientWidth / DEFAULT_CHAR_WIDTH,
                ),
                Rows: Math.round(
                  document.body.clientHeight / DEFAULT_CHAR_HEIGHT,
                ),
              }),
            ]),
          );
        }
      }}
      postSendData={(d) => {
        const tempData = JSON.stringify([
          JSON.stringify({
            Op: 'stdin',
            Data: d || '',
          }),
        ]);
        return tempData;
      }}
      postSocketMessage={(event) => {
        const msg = JSON.parse(JSON.parse(event.data.slice(1))[0]);
        return msg.Data;
      }}
    />
  );
}
