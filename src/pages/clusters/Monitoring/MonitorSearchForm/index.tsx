import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {DatePicker, Form, Input, Select, Button} from 'antd';
import moment from 'moment';
import {useModel} from "@@/plugin-model/useModel";

// @ts-ignore
const MonitorSearchForm = ({onSubmit, formData, pods, dashboard}) => {
  const [form] = Form.useForm();
  const {initialState} = useModel('@@initialState');
  const {name} = initialState!.resource;

  const submitForm = () => {
    form.validateFields().then(onSubmit);
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(formData);
  }, [form, formData]);

  return (
    <Form
      layout="inline"
      form={form}
      initialValues={formData}
      onValuesChange={submitForm}>
      <Form.Item label="时间" shouldUpdate>
        {({getFieldValue}) => (
          <Input.Group compact>
            <Form.Item noStyle name="type" required>
              <Select style={{width: 130}}>
                <Select.Option key="1" value="now-5m">最近 5 分钟</Select.Option>
                <Select.Option key="2" value="now-15m">最近 15 分钟</Select.Option>
                <Select.Option key="3" value="now-30m">最近 30 分钟</Select.Option>
                <Select.Option key="4" value="now-1h">最近 1 小时</Select.Option>
                <Select.Option key="5" value="now-3h">最近 3 小时</Select.Option>
                <Select.Option key="6" value="now-6h">最近 6 小时</Select.Option>
                <Select.Option key="7" value="now-12h">最近 12 小时</Select.Option>
                <Select.Option key="8" value="now-1d">最近 1 天</Select.Option>
                <Select.Option key="9" value="now-3d">最近 3 天</Select.Option>
                <Select.Option key="10" value="now-1w">最近 1 周</Select.Option>
                <Select.Option key="11" value="now-1M">最近 1 月</Select.Option>
                <Select.Option key="12" value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>
            {getFieldValue('type') === 'custom' && (
              <Form.Item
                noStyle
                name="timeRange"
                initialValue={[
                  moment().startOf('day'),
                  moment().endOf('day')
                ]}
                required>
                <DatePicker.RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  allowClear={false}/>
              </Form.Item>
            )}
          </Input.Group>
        )}
      </Form.Item>
      <Form.Item label="自动刷新" name="refresh">
        <Select style={{width: 100}}>
          <Select.Option key="1" value="">关闭</Select.Option>
          <Select.Option key="2" value="5s">5 秒</Select.Option>
          <Select.Option key="3" value="10s">10 秒</Select.Option>
          <Select.Option key="4" value="30s">30 秒</Select.Option>
          <Select.Option key="5" value="1m">1 分钟</Select.Option>
          <Select.Option key="6" value="5m">5 分钟</Select.Option>
          <Select.Option key="7" value="15m">15 分钟</Select.Option>
          <Select.Option key="8" value="30m">30 分钟</Select.Option>
        </Select>
      </Form.Item>
      {
        dashboard === 'basic' && <Form.Item label="Pods" name="podName">
          <Select style={{width: 300}} mode="multiple">
            {
              pods.map((item: string) => (
                <Select.Option key={item} value={item}>{item}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>
      }
      {
        dashboard === 'basic' && <Button type='primary' onClick={() => window.open(`https://nss.netease.com/sentry/appMonitor/view?clusterName=${name}&sign=0`)}>
          哨兵监控
        </Button>
      }
    </Form>
  );
};

MonitorSearchForm.propTypes = {
  formData: PropTypes.shape({}),
  onSubmit: PropTypes.func,
};

export default MonitorSearchForm;
