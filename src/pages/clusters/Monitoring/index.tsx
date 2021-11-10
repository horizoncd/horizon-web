import {useMemo, useState} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {withRouter} from 'umi';
import {formatQueryParam, mergeDefaultValue} from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {useRequest} from "@@/plugin-request/request";
import {getClusterStatus} from "@/services/clusters/clusters";
import {useModel} from "@@/plugin-model/useModel";

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const {query} = location;
  const {podName} = query
  const url = 'http://grafana.yf-dev.netease.com/d/R3l8AsF7z/kubernetes-compute-resources-pod-copy?orgId=1'
  const [pods, setPods] = useState<CLUSTER.PodFromBackend[]>([]);
  const [podNames, setPodNames] = useState<string[]>([]);

  const {data: statusData} = useRequest(() => getClusterStatus(id), {
    onSuccess: () => {
      const {versions} = statusData!.clusterStatus;
      const allPods: CLUSTER.PodFromBackend[] = []
      const allPodNames: string[] = []
      Object.keys(versions).forEach(version => {
        const versionObj = versions[version]
        const {pods: p} = versionObj
        if (p) {
          allPods.push(...Object.values(p))
          allPodNames.push(...Object.keys(p))
        }
      });
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
    if (!url) {
      return 'null';
    }
    const {type, timeRange, refresh} = formData;
    let [from, to] = timeRange;
    if (type !== 'custom') {
      from = type;
      to = 'now';
    } else {
      [from, to] = [from, to].map(e => e.valueOf());
    }
    let podNamesQuery = ''
    if (!podName && podNames.length > 0) {
      podNamesQuery = `&var-pod=${podNames[0]}`
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

    return `${url}&kiosk&theme=light&${queryString.stringify({
      from, to, refresh
    })}&var-namespace=${pods.length > 0 ? pods[0].metadata.namespace : 'default'}&var-datasource=compute-1${podNamesQuery}`;
  }, [url, formData, pods, podNames]);

  return (
    <PageWithBreadcrumb>
      <MonitorSearchForm formData={formData} onSubmit={onSearch} pods={podNames}/>
      <iframe
        src={src}
        style={{
          border: 0, width: '100%', height: '90vh', marginTop: 10
        }}/>
    </PageWithBreadcrumb>
  );
};

export default withRouter(TaskDetailMonitor);
