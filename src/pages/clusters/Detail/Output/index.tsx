import { Card, Table, Tooltip } from 'antd';
import { useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { useIntl } from 'umi';
import styles from '../index.less';
import {
  getClusterOutputs,
} from '@/services/clusters/clusters';
import { CardTitle } from '../Widget';
import { BoldText } from '@/components/Widget';

export default function Output(props: any) {
  const { clusterID } = props;

  const intl = useIntl();

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
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.key' })}</BoldText>,
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
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.value' })}</BoldText>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader,
    },
  ];

  return (
    <Card
      type="inner"
      title={(<CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.output' })}</CardTitle>)}
    >
      <Table
        tableLayout="fixed"
        dataSource={clusterOutputArray}
        columns={outputColumns}
      />
    </Card>
  );
}
