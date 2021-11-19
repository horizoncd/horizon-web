import {useMemo, useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {withRouter} from 'umi';
import {formatQueryParam, mergeDefaultValue} from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {useRequest} from "@@/plugin-request/request";
import {getClusterStatus, getDashboards} from "@/services/clusters/clusters";
import {useModel} from "@@/plugin-model/useModel";
import {Tabs} from "antd";

const {TabPane} = Tabs;

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const {query} = location;
  const {podName} = query

  const [pods, setPods] = useState<CLUSTER.PodFromBackend[]>([]);
  const [podNames, setPodNames] = useState<string[]>([]);
  const [tabKey, setTabKey] = useState<string>('basic');

  const {data: dashboards} = useRequest(() => getDashboards(id));

  const {data: statusData} = useRequest(() => getClusterStatus(id), {
    onSuccess: () => {
      const {versions} = statusData!.clusterStatus;
      const allPods: CLUSTER.PodFromBackend[] = []
      const allPodNames: string[] = []
      if (versions) {
        Object.keys(versions).forEach(version => {
          const versionObj = versions[version]
          const {pods: p} = versionObj
          if (p) {
            allPods.push(...Object.values<CLUSTER.PodFromBackend>(p))
            allPodNames.push(...Object.keys(p))
          }
        });
      }
      setPods(allPods)
      setPodNames(allPodNames)
    }
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day')
    ],
    refresh: '1h',
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
  }, [dashboards, formData, pods, podNames]);

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
