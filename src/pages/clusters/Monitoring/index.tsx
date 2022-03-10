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

export const formatMultiItemQuery = (arr: any[], queryKey: string) => {
  if (!arr || arr.length == 0) {
    return "";
  }
  if (arr.length == 1) {
    return `&${queryKey}=${arr[0]}`;
  }
  return arr.reduce((pre: string, cur: string, curIdx: number) => {
    if (curIdx == 1) {
      return `&${queryKey}=${pre}&${queryKey}=${cur}`
    } else {
      return `${pre}&${queryKey}=${cur}`
    }
  });
}

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const {query} = location;
  const {podName, type: typeFromQuery, timeRange: timeChangeFromQuery, monitor = 'basic'} = query

  const [podNames, setPodNames] = useState<string[]>([]);
  const [containers, setContainers] = useState<CLUSTER.MonitorContainer[]>([]);
  const [containerUrl, setContainerUrl] = useState<string>("");

  const {data: dashboards} = useRequest(() => getDashboards(id), {
    onSuccess: () => {
      setContainerUrl(dashboards!.container)
    }
  });

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
      setContainers(podsData?.pods || [])
    },
    refreshDeps: [typeFromQuery, timeChangeFromQuery]
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day')
    ],
    refresh: '30s',
    podName: podNames.length > 0 ? podNames[0] : undefined,
    container: containers.length > 0 ? `${containers[0].pod}/${containers[0].container}` : undefined,
  }), {
    podName: ['array'],
  }), [query, podNames, containers]);

  const src = useMemo(() => {
    if (!dashboards) {
      return 'null';
    }

    const baseUrl = dashboards[monitor]
    const {type, timeRange, refresh, container} = formData;
    let [from, to] = timeRange;
    if (type !== 'custom') {
      from = type;
      to = 'now';
    } else {
      [from, to] = [from, to].map(e => e.valueOf());
    }
    let podNamesQuery = ''
    // 基础监控才需要选择Pods
    if (monitor === 'basic' || monitor === 'memcached') {
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
          podNamesQuery = formatMultiItemQuery(podName, "var-pod");
        }
      }
    }

    let containerQuery = '';
    if (monitor === 'container') {
      podNamesQuery = `&var-pod=${container.split("/")[0]}`;
      containerQuery = `&var-container=${container.split("/")[1]}`;
    }

    const url = `${baseUrl}&${queryString.stringify({from, to, refresh})}${podNamesQuery}${containerQuery}`;
    return url
  }, [dashboards, query, podNames, containers]);

  const iframe = <iframe src={src} style={{
    border: 0, width: '100%', height: '90vh', marginTop: 10
  }}/>;

  return (
    <PageWithBreadcrumb>
      <Tabs activeKey={monitor} defaultActiveKey={monitor} size={'large'} onChange={(tab) => {
        history.replace({
          query: {
            ...query,
            monitor: tab,
          }
        });
      }}>
        <TabPane tab={'Pod监控'} key="basic">
          <MonitorSearchForm formData={formData} pods={podNames} containers={containers}
                             dashboard={'basic'}/>
          {iframe}
        </TabPane>
        <TabPane tab={'容器监控'} key="container">
          <MonitorSearchForm formData={formData} pods={podNames} containers={containers}
                             dashboard={'container'} baseUrl={containerUrl}/>
          {iframe}
        </TabPane>
        {
          dashboards?.serverless && <TabPane tab={'Serverless'} key="serverless">
            <MonitorSearchForm formData={formData} pods={podNames} dashboard={'serverless'}/>
            {iframe}
          </TabPane>
        }
        {
          dashboards?.memcached && <TabPane tab={'Memcached'} key="memcached">
            <MonitorSearchForm formData={formData} pods={podNames} dashboard={'memcached'}/>
            {iframe}
          </TabPane>
        }
      </Tabs>

    </PageWithBreadcrumb>
  );
};

export default withRouter(TaskDetailMonitor);
