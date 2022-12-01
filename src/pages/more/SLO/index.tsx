import { useMemo, useState } from 'react';
import moment from 'moment';
import queryString from 'query-string';
import { useIntl, withRouter } from 'umi';
import {
  Col, Form, Row, Select, Tabs,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { formatQueryParam, mergeDefaultValue } from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import { queryDashboards } from '@/services/slo/slo';

const { TabPane } = Tabs;

// @ts-ignore
const TaskDetailMonitor = (props: any) => {
  const { location, history } = props;
  const { query } = location;
  const [env, setEnv] = useState('test');
  const intl = useIntl();

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
          <TabPane tab={intl.formatMessage({ id: 'pages.slo.overview' })} key="overview">
            <Form layout="inline">
              <Form.Item label={intl.formatMessage({ id: 'pages.slo.env' })} shouldUpdate>
                <Select style={{ width: 130 }} onSelect={(val: string) => setEnv(val)} value={env}>
                  <Select.Option key="test" value="test">{intl.formatMessage({ id: 'pages.slo.env.test' })}</Select.Option>
                  <Select.Option key="online" value="online">{intl.formatMessage({ id: 'pages.slo.env.online' })}</Select.Option>
                </Select>
              </Form.Item>
            </Form>
            <iframe
              title="overview"
              src={`${dashboards?.overview}`}
              style={{
                border: 0, width: '100%', height: '580px', marginTop: 10,
              }}
            />
          </TabPane>
        </Tabs>
        <Tabs size="large">
          <TabPane tab={intl.formatMessage({ id: 'pages.slo.history' })} key="history">
            <MonitorSearchForm formData={formData} onSubmit={onSearch} />
            <iframe
              title="history"
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
