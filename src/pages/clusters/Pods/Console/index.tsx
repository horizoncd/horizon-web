import Terminal from '@/components/Terminal';
import {useModel} from "@@/plugin-model/useModel";
import {Affix, Card, Select} from "antd";
import {useState} from "react";
import {queryPodContainers} from "@/services/clusters/pods";
import {useRequest} from "@@/plugin-request/request";

const {Option} = Select

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;

  const {location} = props;
  const {query} = location;
  const {podName, containerName} = query;

  const backend = window.location.host
  const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  const [currentContainer, setCurrentContainer] = useState(containerName)
  const [containers, setContainers] = useState<CLUSTER.ContainerDetail[]>()
  const {data} = useRequest(() => queryPodContainers(id, {podName: podName}), {
    onSuccess: () => {
      setContainers(data)
    }
  })

  return (
    <div>
      <Card
        bodyStyle={{alignItems: "center", display: "flex", height: '50px', padding: '0px'}}
      >
        <span style={{marginInline: '5px', fontWeight: 'bold'}}>Shell in</span>
        {
          (containers) && <div>
            <Select
              defaultValue={currentContainer}
              onChange={(value) => {
                setCurrentContainer(value)
              }
              }
            >
              {
                containers?.map((container: CLUSTER.ContainerDetail) => {
                  return <Option value={container.name}>{container.name}</Option>
                })
              }
            </Select>
          </div>
        }
        <span style={{marginInline: '5px', fontWeight: 'bold'}}> in {podName}</span>
      </Card>
      <Terminal
        url={`${protocol}//${backend}/apis/core/v1/clusters/${id}/shell?podName=${podName}&containerName=${currentContainer}`}
        onSocketOpen={(socketRef) => {
          if (socketRef.current) {
            try {
              socketRef.current.sendMessage(
                JSON.stringify([
                  JSON.stringify({
                    Op: 'bind',
                  }),
                ]),
              );
            } catch (error) {
              console.log(error)
            }
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
          try {
            const msg = JSON.parse(JSON.parse(event.data.slice(1))[0]);
            switch (msg.Op) {
              case 'stdout':
                return msg.Data;
              case 'stderr':
                return msg.Data;
              default:
                console.error('Unexpected message type:', msg);
            }
          } catch (error) {
            console.log('data error.', event.data);
          }
        }}
      />
      <Affix
        offsetTop={20}
        style={
          {
            position: 'absolute',
            top: '15px',
            right: '50px',
          }
        }
      >
      </Affix>
    </div>
  );
}
