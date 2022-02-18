import {useMemo, useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {withRouter} from 'umi';
import {formatQueryParam, mergeDefaultValue} from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import {Col, Form, Row, Select, Tabs} from "antd";
import {useRequest} from "@@/plugin-request/request";
import {queryDashboards} from "@/services/slo/slo";

const {TabPane} = Tabs;

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {query} = location;
  const [monitor, setMonitor] = useState('api');
  const [env, setEnv] = useState('test');

  const {data: dashboards} = useRequest(() => queryDashboards(env), {
    refreshDeps: [env]
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day')
    ],
  }), {
    timeRange: ['array', 'moment'],
  }), [query]);

  const onSearch = (data: { timeRange: any[]; }) => {
    history.replace({
      query: {
        ...data,
        timeRange: data.timeRange && data.timeRange.map(e => e.valueOf()),
      }
    });
  };

  const {type, timeRange} = formData;
  let [from, to] = timeRange;
  if (type !== 'custom') {
    from = type;
    to = 'now';
  } else {
    [from, to] = [from, to].map(e => e.valueOf());
  }

  return (
    <Row>
      <Col span={3}/>
      <Col span={18}>
        <Tabs activeKey={"overview"} defaultActiveKey={monitor} size={'large'}>
          <TabPane tab={'概览'} key="overview">
            <Form layout="inline">
              <Form.Item label="环境" shouldUpdate>
                <Select style={{width: 130}} onSelect={(val: string) => setEnv(val)} value={env}>
                  <Select.Option key="test" value="test">测试</Select.Option>
                  <Select.Option key="online" value="online">线上</Select.Option>
                </Select>
              </Form.Item>
            </Form>
            <iframe
              src={`${dashboards?.overview}`}
              style={{
                border: 0, width: '100%', height: '480px', marginTop: 10
              }}/>
          </TabPane>
        </Tabs>
        <Tabs activeKey={monitor} defaultActiveKey={monitor} size={'large'} onChange={(tab) => {
          setMonitor(tab)
        }}>
          <TabPane tab={'API'} key="api">
            <MonitorSearchForm formData={formData} onSubmit={onSearch}/>
            <iframe
              src={`${dashboards?.api}&${queryString.stringify({from, to})}`}
              style={{
                border: 0, width: '100%', height: '820px', marginTop: 10
              }}/>
          </TabPane>
          <TabPane tab={'Pipeline'} key="pipeline">
            <MonitorSearchForm formData={formData} onSubmit={onSearch}/>
            <iframe
              src={`${dashboards?.pipeline}&${queryString.stringify({from, to})}`}
              style={{
                border: 0, width: '100%', height: '1750px', marginTop: 10
              }}/>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default withRouter(TaskDetailMonitor);
