import {
  Button, DatePicker, Select,
} from 'antd';
import moment from 'moment';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { MicroApp } from '@/components/Widget';

const MonitorSearchForm = () => {
  const { initialState } = useModel('@@initialState');
  const { name } = initialState!.resource;
  // @ts-ignore
  const { timeRange, type = 'now-1h' } = history.location.query;
  const timeRanges = [
    { key: 'now-1h', text: '最近1小时' },
    { key: 'now-3h', text: '最近3小时' },
    { key: 'now-6h', text: '最近6小时' },
    { key: 'now-12h', text: '最近12小时' },
    { key: 'now-1d', text: '最近1天' },
    { key: 'now-3d', text: '最近3天' },
    { key: 'custom', text: '自定义' },
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
          自动刷新:
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
            <Select.Option key="1" value="">关闭</Select.Option>
            <Select.Option key="4" value="30s">30 秒</Select.Option>
            <Select.Option key="5" value="1m">1 分钟</Select.Option>
            <Select.Option key="6" value="5m">5 分钟</Select.Option>
          </Select>
        </span>
        <MicroApp name="monitoring" singlePod={singlePod} clusterName={name} />
      </div>
    </div>
  );
};
export default MonitorSearchForm;
