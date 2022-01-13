import {useMemo, useState} from 'react';
import moment, {unitOfTime} from 'moment';
import queryString from 'query-string';
import {withRouter} from 'umi';
import {formatQueryParam, mergeDefaultValue} from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {useRequest} from "@@/plugin-request/request";
import {getClusterPods, getDashboards} from "@/services/clusters/clusters";
import {useModel} from "@@/plugin-model/useModel";
import {Tabs} from "antd";

const {TabPane} = Tabs;

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const {query} = location;
  const {podName, type: typeFromQuery, timeRange: timeChangeFromQuery} = query

  const [podNames, setPodNames] = useState<string[]>([]);
  const [tabKey, setTabKey] = useState<string>('basic');

  const {data: dashboards} = useRequest(() => getDashboards(id));

  const formatStartAndEnd = () => {
    const now = moment()
    if (!typeFromQuery) {
      return [now.subtract(1, 'h').unix(), moment().unix()]
    }

    if (typeFromQuery === 'custom') {
      if (!timeChangeFromQuery) {
        return [moment().startOf('day').unix(), moment().endOf('day').unix()]
      }
      return timeChangeFromQuery.map((item: number) => Math.round(item / 1000));
    }

    const gap = typeFromQuery.split('-')[1] as string;
    const num = parseInt(gap.substring(0, gap.length - 1))
    const t = gap.charAt(gap.length - 1) as unitOfTime.DurationConstructor
    return [now.subtract(num, t).unix(), moment().unix()]
  }

  const startAndEnd = formatStartAndEnd();
  const {data: podsData} = useRequest(() => getClusterPods(id, startAndEnd[0], startAndEnd[1]), {
    onSuccess: () => {
      setPodNames(Array.from(new Set(podsData?.pods.map(item => item.pod) || [])))
    },
    refreshDeps: [typeFromQuery, timeChangeFromQuery]
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day')
    ],
    refresh: '10s',
    podName: podNames.length > 0 ? podNames[0] : undefined
  }), {
    timeRange: ['array', 'moment'],
    podName: ['array']
  }), [query, podNames]);

  const onSearch = (data: { timeRange: any[]; }) => {
    history.replace({
      query: {
        ...data,
        timeRange: data.timeRange && data.timeRange.map(e => e.valueOf()),
      }
    });
  };

  const src = useMemo(() => {
    if (!dashboards) {
      return 'null';
    }

    const baseUrl = dashboards[tabKey]

    const {type, timeRange, refresh} = formData;
    let [from, to] = timeRange;
    if (type !== 'custom') {
      from = type;
      to = 'now';
    } else {
      [from, to] = [from, to].map(e => e.valueOf());
    }
    let podNamesQuery = ''
    // 基础监控才需要选择Pods
    if (tabKey === 'basic') {
      if (!podName && podNames.length > 0) {
        podNamesQuery = `&var-pod=${podNames[0]}`;
      }
      if (typeof podName === 'string') {
        podNamesQuery = `&var-pod=${podName}`
      }
      if (podName instanceof Array) {
        if (podName.length === 0) {
          podNamesQuery = ''
        } else if (podName.length === 1) {
          podNamesQuery = `&var-pod=${podName[0]}`
        } else {
          podNamesQuery = podName.reduce((pre: string, cur: string) => `&var-pod=${pre}&var-pod=${cur}`);
        }
      }
    }

    return `${baseUrl}&${queryString.stringify({from, to, refresh})}${podNamesQuery}`;
  }, [dashboards, formData, podNames, tabKey]);

  return (
    <PageWithBreadcrumb>
      <Tabs activeKey={tabKey} size={'large'} onChange={setTabKey}>
        <TabPane tab={'基础监控'} key="basic">
          <MonitorSearchForm formData={formData} onSubmit={onSearch} pods={podNames} dashboard={'basic'}/>
          {
            dashboards?.basic && <iframe
              src={src}
              style={{
                border: 0, width: '100%', height: '90vh', marginTop: 10
              }}/>
          }
        </TabPane>
        {
          dashboards?.serverless && <TabPane tab={'Serverless'} key="serverless">
            <MonitorSearchForm formData={formData} onSubmit={onSearch} pods={podNames} dashboard={'serverless'}/>
            <iframe
              src={src}
              style={{
                border: 0, width: '100%', height: '90vh', marginTop: 10
              }}/>
          </TabPane>
        }
      </Tabs>

    </PageWithBreadcrumb>
  );
};

export default withRouter(TaskDetailMonitor);
