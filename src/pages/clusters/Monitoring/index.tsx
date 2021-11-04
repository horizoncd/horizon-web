import {useMemo} from 'react';
import moment from 'moment';
import queryString from 'query-string';
import {withRouter} from 'umi';
import {formatQueryParam, mergeDefaultValue} from '@/utils';
import MonitorSearchForm from './MonitorSearchForm';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

// @ts-ignore
const TaskDetailMonitor = ({location, history}) => {
  const {query} = location;
  const {namespace, podName, environment} = query
  // const url = 'http://grafana.yf-onlinetest.netease.com/d/pBhIGKznz/serverless-han-shu-shu-ju-liu?orgId=1'
  const url = 'http://grafana.yf-onlinetest.netease.com/d/6581e46e4e5c7ba40a07646395ef7b23/kubernetes-compute-resources-pod?orgId=1'

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day')
    ],
    refresh: '10s',
  }), {
    timeRange: ['array', 'moment']
  }), [query]);

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
    return `${url}&kiosk&theme=light&${queryString.stringify({
      from, to, refresh
    })}&var-namespace=${namespace}&var-pod=${podName}`;
  }, [url, formData]);

  return (
    <PageWithBreadcrumb>
      <MonitorSearchForm formData={formData} onSubmit={onSearch}/>
      <iframe
        src={src}
        style={{
          border: 0, width: '100%', height: '90vh', marginTop: 10
        }}/>
    </PageWithBreadcrumb>
  );
};

export default withRouter(TaskDetailMonitor);
