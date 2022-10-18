import { useState } from 'react';
import { Select, Table } from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { queryPipelineStats } from '@/services/applications/applications';
import Utils from '@/utils';
import { API } from '@/services/typings';
import { queryClusters } from '@/services/clusters/clusters';

const { Option } = Select;

export default function PipelineStats() {
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
      <span key={step.step}>
        {step.step}
        ：
        {step.duration}
        <br />
      </span>
    );
  };

  const columns = [
    {
      title: '流水线ID',
      key: 'pipelinerunID',
      render: (pipelineStats: API.PipelineStats) => (
        <a href={`/clusters${fullPath}/${pipelineStats.cluster}/-/pipelines/${pipelineStats.pipelinerunID}`}>
          {pipelineStats.pipelinerunID}
        </a>
      ),
    },
    {
      title: '集群',
      dataIndex: 'cluster',
      key: 'cluster',
    },
    {
      title: '各阶段耗时（s）',
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
      title: '总耗时（s）',
      Key: 'duration',
      dataIndex: 'duration',
    },
    {
      title: '结果',
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
      title: '触发时间',
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
        集群：
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
};
