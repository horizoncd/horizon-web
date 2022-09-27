import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useMemo } from 'react';
import { Tabs } from 'antd';
import moment from 'moment/moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import queryString from 'query-string';
import { history } from '@@/core/history';
import { getGrafanaDashboards } from '@/services/clusters/clusters';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { CLUSTER } from '@/services/clusters';
import MonitorSearchForm from '@/pages/clusters/Monitor/MonitorSearchForm';
import { formatQueryParam, mergeDefaultValue } from '@/utils';

const { TabPane } = Tabs;

window.addEventListener('message', (event) => {
  const varParams = {};
  for (let i = 0; i < Object.keys(event.data).length; i += 1) {
    const k = Object.keys(event.data)[i];
    const v = event.data[k];
    if (k.startsWith('var-')) {
      varParams[k] = v;
    }
  }
  history.replace({
    query: {
      ...history.location.query,
      ...varParams,
    },
  });
});

export default () => {
  const { initialState } = useModel('@@initialState');
  const { query } = history.location;
  const { id } = initialState!.resource;
  const { data } = useRequest(() => getGrafanaDashboards(id), {
    onSuccess: () => {
      // find default dashboard
      if (!query!.monitor) {
        for (let i = 0; i < data!.dashboards.length; i += 1) {
          const dashboard = data!.dashboards[i];
          if (dashboard.tags.indexOf('default') > -1) {
            history.replace({
              query: {
                ...history.location.query,
                monitor: dashboard.uid,
              },
            });
          }
        }
      }
    },
  });

  const formData = useMemo(() => formatQueryParam(mergeDefaultValue(query, {
    type: 'now-1h',
    timeRange: [
      moment().startOf('day'),
      moment().endOf('day'),
    ],
    refresh: '30s',
  }), {}), [query]);
  const {
    type, timeRange, refresh,
  } = formData;
  let [from, to] = timeRange;
  if (type !== 'custom') {
    from = type;
    to = 'now';
  } else {
    [from, to] = [from, to].map((e) => e.valueOf());
  }

  const varParams = {};
  // @ts-ignore
  for (let i = 0; i < Object.keys(query).length; i += 1) {
    // @ts-ignore
    const k = Object.keys(query)[i];
    const v = query![k];
    if (k.startsWith('var-')) {
      varParams[k] = v;
    }
  }
  const params = {
    ...data?.params,
    ...varParams,
    from,
    to,
    refresh,
  };
  const iframeURL = `${data?.host}/d/${query!.monitor}?${queryString.stringify(params)}`;

  const sortedDashboards: CLUSTER.GrafanaDashboard[] = [];
  data?.dashboards.forEach((item) => {
    if (item.tags.indexOf('default') > -1) {
      sortedDashboards.unshift(item);
    } else {
      sortedDashboards.push(item);
    }
  });

  return (
    <PageWithBreadcrumb>
      <Tabs
        size="large"
        activeKey={query!.monitor as string}
        onChange={(uid) => {
          history.replace({
            query: {
              ...query,
              monitor: uid,
            },
          });
        }}
      >
        {
          sortedDashboards.map((item: CLUSTER.GrafanaDashboard) => (
            <TabPane tab={item.title} key={item.uid}>
              <MonitorSearchForm />
              <iframe
                src={iframeURL}
                title="grafana-dashboard"
                style={{
                  border: 0,
                  width: '100%',
                  height: '90vh',
                  marginTop: 10,
                }}
              />
            </TabPane>
          ))
        }
      </Tabs>
    </PageWithBreadcrumb>
  );
};
