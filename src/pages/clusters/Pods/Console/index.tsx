import { useModel } from '@@/plugin-model/useModel';
import { Affix, Card, Select } from 'antd';
import { useState } from 'react';
import { useRequest } from '@@/plugin-request/request';
import { queryPodContainers } from '@/services/clusters/pods';
import Terminal from '@/components/Terminal';

const { Option } = Select;

export default (props: any) => {
  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;

  const { location } = props;
  const { query } = location;
  const { podName, containerName } = query;

  const backend = window.location.host;
  const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  const [currentContainer, setCurrentContainer] = useState(containerName);
  const [containers, setContainers] = useState<CLUSTER.ContainerDetail[]>();
  const { data } = useRequest(() => queryPodContainers(id, { podName }), {
    onSuccess: () => {
      setContainers(data);
    },
  });

  return (
    <div>
      <Card
        bodyStyle={{
          alignItems: 'center', display: 'flex', height: '50px', padding: '0px',
        }}
      >
        <span style={{ marginInline: '5px', fontWeight: 'bold' }}>Shell in</span>
        {
          (containers) && (
          <div>
            <Select
              defaultValue={currentContainer}
              onChange={(value) => {
                setCurrentContainer(value);
              }}
            >
              {
                containers?.map((container: CLUSTER.ContainerDetail) => <Option value={container.name}>{container.name}</Option>)
              }
            </Select>
          </div>
          )
        }
        <span style={{ marginInline: '5px', fontWeight: 'bold' }}>
          {` of ${podName}`}
        </span>
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
              // eslint-disable-next-line no-console
              console.log(error);
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
        // eslint-disable-next-line consistent-return
        postSocketMessage={(event) => {
          try {
            const msg = JSON.parse(JSON.parse(event.data.slice(1))[0]);
            switch (msg.Op) {
              case 'stdout':
                return msg.Data;
              case 'stderr':
                return msg.Data;
              default:
                // eslint-disable-next-line no-console
                console.error('Unexpected message type:', msg);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
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
      />
    </div>
  );
};
