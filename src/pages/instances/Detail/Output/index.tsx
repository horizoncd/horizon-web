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

interface ClusterOutput {
  key:string,
  description: string,
  value: string
}

export default function Output(props: any) {
  const { clusterID } = props;

  const intl = useIntl();

  const [clusterOutputArray, setClusterOutputArray] = useState<ClusterOutput[]>();

  useRequest(() => getClusterOutputs(clusterID), {
    refreshDeps: [clusterID],
    onSuccess: (items) => {
      let outputs: ClusterOutput[] = [];
      Object.keys(items).forEach((key) => {
        outputs = outputs.concat({
          key,
          description: items[key].description,
          value: items[key].value,
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
        pagination={
          { hideOnSinglePage: true }
        }
        showHeader={clusterOutputArray && clusterOutputArray.length > 0}
        tableLayout="fixed"
        dataSource={clusterOutputArray}
        columns={outputColumns}
      />
    </Card>
  );
}
