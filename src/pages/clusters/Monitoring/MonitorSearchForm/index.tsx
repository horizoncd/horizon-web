import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Button, Checkbox, DatePicker, Form, Select} from 'antd';
import moment from 'moment';
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';

// @ts-ignore
const MonitorSearchForm = ({formData, pods, containers, dashboard}) => {
  const [form] = Form.useForm();
  const {initialState} = useModel('@@initialState');
  const {name} = initialState!.resource;

  const submitForm = (changed: any) => {
    // podName is changed
    if (changed.podName) {
      history.replace({
        query: {
          ...history.location.query,
          ...changed,
          container: dashboard === 'basic' && changed.podName.length > 1 ? [name] : containers,
        }
      });
    } else {
      history.replace({
        query: {
          ...history.location.query,
          ...changed,
        }
      });
    }
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
        container: dashboard === 'basic' && newPodName.length > 1 ? [name] : containers,
      }
    });
  }

  const formatPodSelect = () => {
    return <Form.Item label="Pods" name="podName">
      <Select style={{width: 300}} mode="multiple">
        <Select.Option key="all" value="all" style={{textAlign: 'right', paddingRight: '5px'}} disabled>
          <Checkbox checked={history.location.query?.podName?.length === pods.length} onChange={(e) => selectAllPods(e.target.checked)}>全选</Checkbox>
        </Select.Option>
        {
          pods.map((item: string) => (
            <Select.Option key={item} value={item}>{item}</Select.Option>
          ))
        }
      </Select>
    </Form.Item>
  }

  const formatContainerSelect = () => {
    return <Form.Item label="Containers" name="container">
      <Select style={{width: 300}} mode="multiple">
        {
          containers.map((item: string) => (
            <Select.Option key={item} value={item}>{item}</Select.Option>
          ))
        }
      </Select>
    </Form.Item>
  }

  const timeRange = history.location.query?.timeRange
  const type = history.location.query?.type || 'now-1h'

  return (
    <div>
      <Form
        layout="inline"
        form={form}
        initialValues={formData}
        onValuesChange={submitForm}>
        {
          (dashboard === 'basic') && formatPodSelect()
        }
        {
          (dashboard === 'basic') && formatContainerSelect()
        }
        {
          (dashboard === 'memcached') && formatPodSelect()
        }
        {
          dashboard === 'basic' && <Button type='primary'
                                           onClick={() => window.open(`https://nss.netease.com/sentry/appMonitor/view?clusterName=${name}&sign=0`)}>
            哨兵监控
          </Button>
        }
      </Form>
      <div style={{marginTop: 10}}>
        {
          [
            {key: "now-1h", text: "最近1小时"},
            {key: "now-3h", text: "最近3小时"},
            {key: "now-6h", text: "最近6小时"},
            {key: "now-12h", text: "最近12小时"},
            {key: "now-1d", text: "最近1天"},
            {key: "now-3d", text: "最近3天"},
            {key: "custom", text: "自定义"},
          ].map(item =>
            <Button value="now-1h" key={item.key}
                    type={type === item.key ? "primary" : "default"}
                    onClick={() => history.replace({
                      query: {
                        ...history.location.query,
                        monitor: dashboard,
                        type: item.key,
                      }
                    })}
                    style={{marginRight: 5}}
            >
              {item.text}
            </Button>
          )
        }
        {
          history.location.query?.type === 'custom' && <DatePicker.RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            allowClear={false}
            onChange={(dates) => {
              // @ts-ignore
              history.replace({
                query: {
                  ...history.location.query,
                  monitor: dashboard,
                  timeRange: dates?.map(e => e?.valueOf())
                }
              })
            }}
            value={[
              timeRange ? moment.unix(parseInt(timeRange[0]) / 1000) : moment().startOf('day'),
              timeRange ? moment.unix(parseInt(timeRange[1]) / 1000) : moment().endOf('day'),
            ]}
          />
        }
        <span style={{margin: '0 10px'}}>
          自动刷新:
        </span>
        <span>
          <Select style={{width: 100}} defaultValue={'30s'} onSelect={(item: string) => {
            history.replace({
              query: {
                ...history.location.query,
                monitor: dashboard,
                refresh: item
              }
            })
          }}>
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
};

export default MonitorSearchForm;
