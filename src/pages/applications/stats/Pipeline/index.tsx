import { useState } from 'react';
import {
  Col, Row, Select, Table,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { queryPipelineStats } from '@/services/applications/applications';
import Utils from '@/utils';
import { queryClusters } from '@/services/clusters/clusters';

const { Option } = Select;

export default function PipelineStats() {
  const intl = useIntl();
  const [pageNumber, setPageNumber] = useState(1);
  const [cluster, setCluster] = useState<string>('');
  const { initialState } = useModel('@@initialState');
  const { id, fullPath } = initialState!.resource;
  const pageSize = 10;

  const { data: pipelines } = useRequest(() => queryPipelineStats(id, cluster, pageNumber, pageSize), {
    refreshDeps: [pageNumber, cluster],
    debounceInterval: 200,
  });

  const { data: clusters } = useRequest(() => queryClusters(id, {
    pageNumber: 1,
    pageSize: 50,
  }));

  const clusterOptions = clusters?.items.map((item) => <Option key={item.id} value={item.name}>{item.name}</Option>);

  const formatDuration = (step: API.StepStats) => {
    if (!step) {
      return '';
    }
    return (
      <Row key={step.step}>
        <Col span={6} style={{ textAlign: 'right' }}>
          {step.step}
        </Col>
        ：
        <Col>
          {step.duration}
        </Col>
        <br />
      </Row>
    );
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.statistics.pipeline.id' }),
      key: 'pipelinerunID',
      render: (pipelineStats: API.PipelineStats) => (
        <a href={`/instances${fullPath}/${pipelineStats.cluster}/-/pipelines/${pipelineStats.pipelinerunID}`}>
          {pipelineStats.pipelinerunID}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.appinstance' }),
      dataIndex: 'cluster',
      key: 'cluster',
    },
    {
      title: intl.formatMessage({ id: 'pages.statistics.pipeline.stepDuration' }),
      Key: 'durations',
      render: (pipelineStats: API.PipelineStats) => {
        const { tasks } = pipelineStats;
        const durations = [];
        if (!tasks) {
          return '';
        }
        for (let i = 0; i < tasks.length; i += 1) {
          const { steps } = tasks[i];
          if (steps) {
            for (let j = 0; j < steps.length; j += 1) {
              durations.push(formatDuration(steps[j]));
            }
          }
        }
        return durations;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.statistics.pipeline.totalDuration' }),
      Key: 'duration',
      dataIndex: 'duration',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.result' }),
      Key: 'result',
      dataIndex: 'result',
      render: (result: string) => {
        if (result === 'failed') {
          return <strong style={{ color: 'red' }}>{result}</strong>;
        }
        return <strong style={{ color: 'green' }}>{result}</strong>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.statistics.pipeline.startedAt' }),
      dataIndex: 'startedAt',
      Key: 'startedAt',
      render: (time: string) => Utils.timeToLocal(time),
    },
  ];

  const table = (
    <Table
      rowKey="pipelinerunID"
      columns={columns}
      dataSource={pipelines?.items}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        pageSize,
        total: pipelines?.total,
        onChange: (page) => setPageNumber(page),
      }}
    />
  );

  return (
    <PageWithBreadcrumb>
      <div style={{ marginBottom: 10 }}>
        {intl.formatMessage({ id: 'pages.common.appinstance' })}
        {'： '}
        <Select
          showSearch
          allowClear
          onClear={() => setCluster('')}
          style={{ width: '20%' }}
          onSelect={(item: string) => setCluster(item)}
        >
          {clusterOptions}
        </Select>
      </div>
      {table}
    </PageWithBreadcrumb>
  );
}
