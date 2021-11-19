import Terminal, {DEFAULT_CHAR_HEIGHT, DEFAULT_CHAR_WIDTH,} from '@/components/Terminal';
import {useRequest} from "@@/plugin-request/request";
import {queryTerminalSessionID} from "@/services/clusters/pods";
import {useModel} from "@@/plugin-model/useModel";

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;

  const {location} = props;
  const {query} = location;
  const {podName, containerName} = query;

  const backend = window.location.host

  const {data} = useRequest(() => queryTerminalSessionID(id, {
    podName, containerName
  }))

  const {id: sessionID} = data || {};

  const url = `ws://${backend}/apis/front/v1/terminal/${sessionID}/websocket`
  return (
    sessionID ? <Terminal
      url={url}
      onSocketOpen={(socketRef) => {
        if (socketRef.current) {
          socketRef.current.sendMessage(
            JSON.stringify([
              JSON.stringify({
                Op: 'bind',
                SessionID: sessionID,
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
        return JSON.stringify([
          JSON.stringify({
            Op: 'stdin',
            SessionID: sessionID,
            Data: d || '',
          }),
        ]);
      }}
      postSocketMessage={(event) => {
        const msg = JSON.parse(JSON.parse(event.data.slice(1))[0]);
        return msg.Data;
      }}
    /> : <div/>
  );
}
