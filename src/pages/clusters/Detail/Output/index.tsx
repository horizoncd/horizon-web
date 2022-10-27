import { Card, Table, Tooltip } from 'antd';
import { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import styles from '../index.less';
import {
  getClusterOutputs,
} from '@/services/clusters/clusters';
import { CardTitle, BoldText } from '../Widget';

export default function Output(props: any) {
  const { clusterID } = props;

  const [clusterOutputArray, setClusterOutputArray] = useState();

  const { data: clusterOutputs } = useRequest(() => getClusterOutputs(clusterID), {
    refreshDeps: [clusterID],
    onSuccess: () => {
      let outputs: any = [];
      Object.keys(clusterOutputs!).forEach((name: string) => {
        outputs = outputs.concat({
          key: name,
          description: clusterOutputs![name].description,
          value: clusterOutputs![name].value,
        });
      });
      setClusterOutputArray(outputs);
    },
  });

  const outputColumns = [
    {
      title: <BoldText>键</BoldText>,
      dataIndex: 'key',
      key: 'key',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '5px' }}>{text}</span>
          <Tooltip
            placement="right"
            className={styles.textDescription}
            title={(
              <span style={{
                whiteSpace: 'pre-line',
              }}
              >
                {record.description}
              </span>
            )}
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </div>
      ),
      width: '30%',
      className: styles.tableHeader,
    },
    {
      title: <BoldText>值</BoldText>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader,
    },
  ];

  return (
    <Card
      type="inner"
      title={(<CardTitle>输出</CardTitle>)}
    >
      <Table
        tableLayout="fixed"
        dataSource={clusterOutputArray}
        columns={outputColumns}
      />
    </Card>
  );
}
