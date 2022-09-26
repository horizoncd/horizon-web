import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Checkbox, DatePicker, Form, Modal, Select,
} from 'antd';
import moment from 'moment';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import queryString from 'query-string';
import { formatMultiItemQuery } from '../index';

// @ts-ignore
const MonitorSearchForm = ({
  formData, pods, containers, dashboard, baseUrl,
}) => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { name } = initialState!.resource;
  const [visible, setVisible] = useState(false);
  const [comparePods, setComparePods] = useState<string[]>([]);
  const [rangeType, setRangeType] = useState<string>('now-1h');
  const [compareTimeRange, setCompareTimeRange] = useState<string[]>([moment().startOf('day').unix().toString(),
    moment().endOf('day').unix().toString()]);

  const submitForm = (changed: any) => {
    history.replace({
      query: {
        ...history.location.query,
        ...changed,
      },
    });
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(formData);
  }, [form, formData]);

  const selectAllPods = (checked: boolean) => {
    const newPodName = checked ? pods : [pods[0]];
    history.replace({
      query: {
        ...history.location.query,
        podName: newPodName,
      },
    });
  };

  const formatPodSelect = () => (
    <Form.Item label="Pods" name="podName">
      <Select style={{ width: 400 }} mode="multiple">
        <Select.Option key="all" value="all" style={{ textAlign: 'right', paddingRight: '5px' }} disabled>
          <Checkbox
            checked={history.location.query?.podName?.length === pods.length}
            onChange={(e) => selectAllPods(e.target.checked)}
          >
            全选
          </Checkbox>
        </Select.Option>
        {
          pods.map((item: string) => (
            <Select.Option key={item} value={item}>{item}</Select.Option>
          ))
        }
      </Select>
    </Form.Item>
  );

  const formatContainerSelect = () => (
    <Form.Item label="Container" name="container">
      <Select
        style={{ width: 500 }}
        showSearch
        filterOption={(input: string, option) =>
        // @ts-ignore
          option.key.indexOf(input) > -1}
        optionLabelProp="key"
      >
        {
          containers.map((item: CLUSTER.MonitorContainer) => (
            <Select.Option key={`${item.container} [${item.pod}]`} value={`${item.pod}/${item.container}`}>
              {item.container}
              {' '}
              [
              {item.pod}
              ]
            </Select.Option>
          ))
        }
      </Select>
    </Form.Item>
  );

  const timeRange = history.location.query?.timeRange;
  const type = history.location.query?.type || 'now-1h';
  const containerWithPod = history.location.query?.container || form.getFieldValue('container');
  const container = containerWithPod ? containerWithPod.split('/')[1] : '';
  const timeRanges = [
    { key: 'now-1h', text: '最近1小时' },
    { key: 'now-3h', text: '最近3小时' },
    { key: 'now-6h', text: '最近6小时' },
    { key: 'now-12h', text: '最近12小时' },
    { key: 'now-1d', text: '最近1天' },
    { key: 'now-3d', text: '最近3天' },
    { key: 'custom', text: '自定义' },
  ];

  const compareSrc = useMemo(() => {
    if (!baseUrl) {
      return 'null';
    }
    let [from, to] = ['', ''];
    if (rangeType !== 'custom') {
      from = rangeType;
      to = 'now';
    } else {
      [from, to] = compareTimeRange;
    }
    const podNamesQuery = comparePods.length > 0 ? formatMultiItemQuery(comparePods, 'var-pod') : '&var-pod=no-pods';
    const containerQuery = `&var-container=${container}`;
    return `${baseUrl}&${queryString.stringify({ from, to })}${podNamesQuery}${containerQuery}`;
  }, [comparePods, history.location.query, rangeType, compareTimeRange, visible]);

  return (
    <div>
      <Form
        layout="inline"
        form={form}
        initialValues={formData}
        onValuesChange={submitForm}
      >
        {
          (dashboard === 'basic') && formatPodSelect()
        }
        {
          (dashboard === 'container') && formatContainerSelect()
        }
        {
          (dashboard === 'container') && pods.length > 0 && (
          <Button
            type="primary"
            onClick={() => {
              setVisible(true);
            }}
          >
            多容器对比
          </Button>
          )
        }
        <Modal
          title={`正在比对容器 [ ${container} ] , 请选择 Pod`}
          centered
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          width={1000}
          cancelText={null}
        >
          <div>
            <div>
              <span style={{ marginRight: 10 }}>Pods: </span>
              <Select
                style={{ width: 400 }}
                mode="multiple"
                onChange={(value, options) => {
                  setComparePods(options.map((item: { value: any; }) => item.value));
                }}
                value={comparePods}
              >
                {
                  pods.map((item: string) => (
                    <Select.Option key={item} value={item}>{item}</Select.Option>
                  ))
                }
              </Select>
              <div style={{ marginTop: 10 }}>
                {
                  timeRanges.map((item) => (
                    <Button
                      key={item.key}
                      type={rangeType === item.key ? 'primary' : 'default'}
                      onClick={() => setRangeType(item.key)}
                      style={{ marginRight: 5 }}
                    >
                      {item.text}
                    </Button>
                  ))
                }
                {
                  rangeType === 'custom' && (
                  <DatePicker.RangePicker
                    showTime
                    style={{ marginTop: 10 }}
                    format="YYYY-MM-DD HH:mm:ss"
                    allowClear={false}
                    onChange={(dates) => {
                      setCompareTimeRange(dates!.map((e) => e!.valueOf().toString()));
                    }}
                    value={[
                      moment.unix(parseInt(compareTimeRange[0])),
                      moment.unix(parseInt(compareTimeRange[1])),
                    ]}
                  />
                  )
                }
              </div>
              <iframe
                src={compareSrc}
                style={{
                  border: 0, width: '100%', height: '90vh', marginTop: 10,
                }}
              />
            </div>
          </div>
        </Modal>
        {
          dashboard === 'memcached' && formatPodSelect()
        }
        {
          dashboard === 'basic'
          && (
          <Button
            type="primary"
            disabled={pods.length == 0}
            onClick={() => {
              window.open(`https://nss.netease.com/sentry/appMonitor/view?clusterName=${name}&podName=${form.getFieldValue('podName')[0]}&sign=0`);
            }}
          >
            哨兵监控
          </Button>
          )
        }
      </Form>
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
              timeRange ? moment.unix(parseInt(timeRange[0]) / 1000) : moment().startOf('day'),
              timeRange ? moment.unix(parseInt(timeRange[1]) / 1000) : moment().endOf('day'),
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
      </div>
    </div>
  );
};

MonitorSearchForm.propTypes = {
  formData: PropTypes.shape({}),
  pods: PropTypes.array,
  containers: PropTypes.array,
  dashboard: PropTypes.string,
  baseUrl: PropTypes.string,
};

export default MonitorSearchForm;
