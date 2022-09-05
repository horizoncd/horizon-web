import { useMemo, useState } from 'react';
import moment from 'moment';
import queryString from 'query-string';
import { withRouter } from 'umi';
import {
  Col, Form, Row, Select, Tabs,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { formatQueryParam, mergeDefaultValue } from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import { queryDashboards } from '@/services/slo/slo';

const { TabPane } = Tabs;

// @ts-ignore
const TaskDetailMonitor = ({ location, history }) => {
  const { query } = location;
  const [env, setEnv] = useState('test');

  const { data: dashboards } = useRequest(() => queryDashboards(env), {
    refreshDeps: [env],
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day'),
    ],
  }), {
    timeRange: ['array', 'moment'],
  }), [query]);

  const onSearch = (data: { timeRange: any[]; }) => {
    history.replace({
      query: {
        ...data,
        timeRange: data.timeRange && data.timeRange.map((e) => e.valueOf()),
      },
    });
  };

  const { type, timeRange } = formData;
  let [from, to] = timeRange;
  if (type !== 'custom') {
    from = type;
    to = 'now';
  } else {
    [from, to] = [from, to].map((e) => e.valueOf());
  }

  return (
    <Row>
      <Col span={2} />
      <Col span={20}>
        <Tabs activeKey="overview" size="large">
          <TabPane tab="概览" key="overview">
            <Form layout="inline">
              <Form.Item label="环境" shouldUpdate>
                <Select style={{ width: 130 }} onSelect={(val: string) => setEnv(val)} value={env}>
                  <Select.Option key="test" value="test">测试</Select.Option>
                  <Select.Option key="online" value="online">线上</Select.Option>
                </Select>
              </Form.Item>
            </Form>
            <iframe
              src={`${dashboards?.overview}`}
              style={{
                border: 0, width: '100%', height: '580px', marginTop: 10,
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs size="large">
          <TabPane tab="历史" key="history">
            <MonitorSearchForm formData={formData} onSubmit={onSearch} />
            <iframe
              src={`${dashboards?.history}&${queryString.stringify({ from, to })}`}
              style={{
                border: 0, width: '100%', height: '2820px', marginTop: 10,
              }}
            />
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default withRouter(TaskDetailMonitor);
