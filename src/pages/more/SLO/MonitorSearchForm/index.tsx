import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker, Form, Input, Select,
} from 'antd';
import moment from 'moment';
import { useIntl } from 'umi';

// @ts-ignore
const MonitorSearchForm = ({ onSubmit, formData }) => {
  const [form] = Form.useForm();
  const intl = useIntl();

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
      onValuesChange={submitForm}
    >
      <Form.Item label={intl.formatMessage({ id: 'pages.slo.time' })} shouldUpdate>
        {({ getFieldValue }) => (
          <Input.Group compact>
            <Form.Item noStyle name="type" required>
              <Select style={{ width: 130 }}>
                <Select.Option key="4" value="now-1h">{intl.formatMessage({ id: 'pages.slo.last.1h' })}</Select.Option>
                <Select.Option key="5" value="now-3h">{intl.formatMessage({ id: 'pages.slo.last.3h' })}</Select.Option>
                <Select.Option key="6" value="now-6h">{intl.formatMessage({ id: 'pages.slo.last.6h' })}</Select.Option>
                <Select.Option key="7" value="now-12h">{intl.formatMessage({ id: 'pages.slo.last.12h' })}</Select.Option>
                <Select.Option key="8" value="now-1d">{intl.formatMessage({ id: 'pages.slo.last.1d' })}</Select.Option>
                <Select.Option key="9" value="now-3d">{intl.formatMessage({ id: 'pages.slo.last.3d' })}</Select.Option>
                <Select.Option key="10" value="now-1w">{intl.formatMessage({ id: 'pages.slo.last.1w' })}</Select.Option>
                <Select.Option key="11" value="now-1M">{intl.formatMessage({ id: 'pages.slo.last.1mon' })}</Select.Option>
                <Select.Option key="12" value="custom">{intl.formatMessage({ id: 'pages.slo.custom' })}</Select.Option>
              </Select>
            </Form.Item>
            {getFieldValue('type') === 'custom' && (
              <Form.Item
                noStyle
                name="timeRange"
                initialValue={[
                  moment().startOf('day'),
                  moment().endOf('day'),
                ]}
                required
              >
                <DatePicker.RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  allowClear={false}
                />
              </Form.Item>
            )}
          </Input.Group>
        )}
      </Form.Item>
    </Form>
  );
};

MonitorSearchForm.propTypes = {
  formData: PropTypes.shape({}),
  onSubmit: PropTypes.func,
};

MonitorSearchForm.defaultProps = {
  formData: {},
  onSubmit: () => {},
};

export default MonitorSearchForm;
