import {
  Button, DatePicker, Select,
} from 'antd';
import moment from 'moment';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl } from 'umi';
import { MicroApp } from '@/components/Widget';

const MonitorSearchForm = () => {
  const { initialState } = useModel('@@initialState');
  const { name } = initialState!.resource;
  const intl = useIntl();
  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({ id: `pages.cluster.monitor.${suffix}`, defaultMessage: defaultMsg });
  // @ts-ignore
  const { timeRange, type = 'now-1h' } = history.location.query;
  const timeRanges = [
    { key: 'now-1h', text: formatMessage('last.1h') },
    { key: 'now-3h', text: formatMessage('last.3h') },
    { key: 'now-6h', text: formatMessage('last.6h') },
    { key: 'now-12h', text: formatMessage('last.12h') },
    { key: 'now-1d', text: formatMessage('last.1d') },
    { key: 'now-3d', text: formatMessage('last.3d') },
    { key: 'custom', text: formatMessage('custom') },
  ];

  const varPods = history.location.query!['var-pod'];
  const singlePod = (varPods === 'All' || Array.isArray(varPods) || !varPods) ? '' : `&podName=${varPods}`;

  return (
    <div>
      <div style={{ marginTop: 10 }}>
        {
          timeRanges.map((item) => (
            <Button
              key={item.key}
              type={type === item.key ? 'primary' : 'default'}
              onClick={() => history.replace({
                query: {
                  ...history.location.query,
                  type: item.key,
                },
              })}
              style={{ marginRight: 5 }}
            >
              {item.text}
            </Button>
          ))
        }
        {
          history.location.query?.type === 'custom' && (
          <DatePicker.RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            allowClear={false}
            onChange={(dates) => {
              // @ts-ignore
              history.replace({
                query: {
                  ...history.location.query,
                  timeRange: dates?.map((e) => e?.valueOf()),
                },
              });
            }}
            value={[
              timeRange ? moment.unix(parseInt(timeRange[0], 10) / 1000) : moment().startOf('day'),
              timeRange ? moment.unix(parseInt(timeRange[1], 10) / 1000) : moment().endOf('day'),
            ]}
          />
          )
        }
        <span style={{ margin: '0 10px' }}>
          {formatMessage('autoRefresh')}
          :
        </span>
        <span>
          <Select
            style={{ width: 100 }}
            defaultValue="30s"
            onSelect={(item: string) => {
              history.replace({
                query: {
                  ...history.location.query,
                  refresh: item,
                },
              });
            }}
          >
            <Select.Option key="1" value="">{intl.formatMessage({ id: 'pages.common.close' })}</Select.Option>
            <Select.Option key="4" value="30s">{formatMessage('autoRefresh.30s')}</Select.Option>
            <Select.Option key="5" value="1m">{formatMessage('autoRefresh.1min')}</Select.Option>
            <Select.Option key="6" value="5m">{formatMessage('autoRefresh.5min')}</Select.Option>
          </Select>
        </span>
        <MicroApp name="monitoring" singlePod={singlePod} clusterName={name} />
      </div>
    </div>
  );
};
export default MonitorSearchForm;
