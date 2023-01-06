import { useModel } from '@@/plugin-model/useModel';
import {
  Button, Col, Form, Input, Row, Select,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

export enum ValueType {
  Single,
  Multiple,
}

interface Props {
  queryTags: () => Promise<any>;
  updateTags: (param: any) => Promise<any>;

  valueType: ValueType
  // callback func after update
  callback?: () => void
  disabled?: boolean
}

const DynamicTagForm = (props: Props) => {
  const {
    queryTags, updateTags, valueType, callback, disabled = false,
  } = props;
  const [form] = Form.useForm();
  const { successAlert, errorAlert } = useModel('alert');
  const intl = useIntl();

  const { data, run: refresh } = useRequest(() => queryTags(), {
    onSuccess: () => {
      form.setFieldsValue(data);
    },
  });

  const { run: update } = useRequest((request) => updateTags(request), {
    manual: true,
    onSuccess: () => {
      successAlert(intl.formatMessage({ id: 'pages.message.tags.editSuccess' }));
    },
    onError: () => {
      successAlert(intl.formatMessage({ id: 'pages.message.tags.editFail' }));
    },
  });

  const onFinish = (values: any) => {
    update(values).then(() => {
      refresh().then();
      if (callback) {
        callback();
      }
    });
  };

  const valueKey = valueType === ValueType.Multiple ? 'values' : 'value';
  const valueRules = valueType === ValueType.Multiple ? [] : [{
    required: true,
    message: intl.formatMessage({ id: 'pages.message.tags.value.hint' }),
    max: 1280,
  }];

  const keyRuleMessage = intl.formatMessage({ id: 'pages.message.tags.key.hint' });
  return (
    <div>
      <Row style={{ marginBottom: 5 }}>
        <Col span={12}>
          <span style={{ color: 'red' }}>*</span>
          {' '}
          {intl.formatMessage({ id: 'pages.tags.key' })}
        </Col>
        <Col>
          <span style={{ color: 'red' }}>*</span>
          {' '}
          {intl.formatMessage({ id: 'pages.tags.value' })}
        </Col>
      </Row>
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
        form={form}
        layout="vertical"
      >
        <Form.List name="tags">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }}>
                  <Form.Item
                    style={{ flex: 1 }}
                    name={[name, 'key']}
                    rules={[{
                      required: true,
                      message: keyRuleMessage,
                      max: 63,
                    }, () => ({
                      validator(_, value) {
                        const arr = value.split('/');
                        if (arr.length > 2) {
                          return Promise.reject(new Error(keyRuleMessage));
                        }
                        const reg = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
                        for (let i = 0; i < arr.length; i += 1) {
                          if (!arr[i] || !reg.test(arr[i])) {
                            return Promise.reject(new Error(keyRuleMessage));
                          }
                        }
                        return Promise.resolve();
                      },
                    })]}
                  >
                    <Input disabled={disabled} placeholder={intl.formatMessage({ id: 'pages.tags.key' })} />
                  </Form.Item>
                  <Form.Item
                    style={{ flex: 1, marginInline: '10px' }}
                    name={[name, valueKey]}
                    rules={valueRules}
                  >
                    {
                      valueType === ValueType.Multiple
                        ? (
                          <Select
                            disabled={disabled}
                            mode="tags"
                            placeholder={intl.formatMessage({ id: 'pages.message.tags.value.placeholder' })}
                          />
                        )
                        : <Input disabled={disabled} placeholder="value" />
                    }
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </div>
              ))}
              <Form.Item>
                <Button
                  disabled={disabled}
                  type="dashed"
                  onClick={() => {
                    if (fields.length >= 20) {
                      errorAlert(intl.formatMessage({ id: 'pages.message.tags.limit' }));
                    } else {
                      add();
                    }
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  {intl.formatMessage({ id: 'pages.tags.add' })}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button disabled={disabled} type="primary" htmlType="submit">
            {intl.formatMessage({ id: 'pages.common.submit' })}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

DynamicTagForm.defaultProps = {
  callback: () => { },
  disabled: false,
};

export default DynamicTagForm;
