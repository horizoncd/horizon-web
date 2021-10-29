import Terminal, {DEFAULT_CHAR_HEIGHT, DEFAULT_CHAR_WIDTH,} from '@/components/Terminal';
import {useRequest} from "@@/plugin-request/request";
import {queryTerminalSessionID} from "@/services/clusters/pods";
import {useModel} from "@@/plugin-model/useModel";

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const {id, parentID} = initialState!.resource;

  const {location} = props;
  const {query} = location;
  const {namespace, podName, containerName, environment} = query;

  const {data} = useRequest(() => queryTerminalSessionID(parentID, id, {
    namespace, podName, containerName, environment
  }))

  const {id: sessionID} = data || {};

  const backend = 'horizon.yf-dev.netease.com'

  const url = `ws://${backend}/api/v1/sockjs/556/jsjljngo/websocket?${sessionID}`;

  return (
    <Terminal
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
    />
  );
}
