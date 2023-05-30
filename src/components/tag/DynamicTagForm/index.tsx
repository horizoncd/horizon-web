import { useModel } from '@@/plugin-model/useModel';
import {
  AutoComplete,
  Button, Col, Form, Input, Row, Select, Space,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { DefaultOptionType } from 'antd/lib/select';
import { FormInstance } from 'antd';
import { getMetaTagKeys, getMetatagsByKey } from '@/services/tags/tags';

export enum ValueType {
  Single,
  Multiple,
}

export const TagFormName = 'tags';

interface PairProps {
  itemKey: number,
  itemName: number,
  metaKeys: string[],
  valueType: ValueType
  remove: (name :number) => void,
  form: FormInstance,
  disabled: boolean,
}

function Pair(props: PairProps) {
  const {
    itemKey, itemName, remove, valueType, disabled, metaKeys, form,
  } = props;

  const intl = useIntl();
  const [selectedKey, setSelectedKey] = useState<string>();
  const [mustSelected, setMustSelected] = useState<boolean>(false);
  const [metaValues, setMetaValues] = useState<DefaultOptionType[]>([]);

  const [keyRuleMessage, valueKey, valueRules] = useMemo(() => [
    intl.formatMessage({ id: 'pages.message.tags.key.hint' }),
    valueType === ValueType.Multiple ? 'values' : 'value',
    valueType === ValueType.Multiple ? [] : [{
      required: true,
      message: intl.formatMessage({ id: 'pages.message.tags.value.hint' }),
      max: 1280,
    }]], [intl, valueType]);

  const { run: runGetMetatagsByKey } = useRequest((key: string) => getMetatagsByKey(key ?? ''), {
    onSuccess: (result) => {
      const values = result.map((v) => ({ label: v.tagValue, value: v.tagValue }));
      setMetaValues(values);
      setMustSelected(true);
    },
    manual: true,
  });

  const metaKeysIndex = useMemo(() => {
    const index: Map<string, number> = new Map();
    metaKeys.forEach((k, i) => { index.set(k, i); });
    return index;
  }, [metaKeys]);

  useEffect(() => {
    const key = form.getFieldValue([TagFormName, itemName, 'key']);
    setSelectedKey(key);
    if (metaKeysIndex.get(key) !== undefined) {
      runGetMetatagsByKey(key);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemName, metaKeysIndex]);

  const setSelectedKeyWrapped = useCallback((key: string) => {
    if (metaKeysIndex.get(key) !== undefined) {
      if (key !== selectedKey) {
        form.setFieldValue([TagFormName, itemName, valueKey], undefined);
        form.setFieldValue([TagFormName, itemName, 'key'], key);
      }
      setMustSelected(true);
      runGetMetatagsByKey(key);
    } else {
      setMustSelected(false);
    }
    setSelectedKey(key);
  }, [form, itemName, metaKeysIndex, runGetMetatagsByKey, selectedKey, valueKey]);

  const valueInput = useMemo(() => {
    const k = `tags_${itemName}_${itemKey}_value`;
    if (valueType === ValueType.Multiple) {
      return (
        <Select
          key={k}
          disabled={disabled}
          mode="tags"
          options={metaValues}
          placeholder={intl.formatMessage({ id: 'pages.message.tags.value.placeholder' })}
        />
      );
    }

    if (mustSelected) {
      return <Select key={k} options={metaValues} disabled={disabled} placeholder="value" showSearch />;
    }
    return <Input key={k} disabled={disabled} placeholder="value" />;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, intl, itemKey, itemName, metaValues, mustSelected, valueType, selectedKey]);

  return (
    <div key={itemKey} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }}>
      <Form.Item
        style={{ flex: 1 }}
        name={[itemName, 'key']}
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
        <AutoComplete
          // @ts-ignore
          // onChange={(e) => { setSelectedKeyWrapped(e.target.value); }}
          onChange={(v) => { setSelectedKeyWrapped(v); }}
          options={metaKeys.map((k) => ({ value: k }))}
          disabled={disabled}
          placeholder={intl.formatMessage({ id: 'pages.tags.key' })}
        />
      </Form.Item>
      <Form.Item
        style={{ flex: 1, marginInline: '10px' }}
        name={[itemName, valueKey]}
        rules={valueRules}
      >
        {valueInput}
      </Form.Item>
      <MinusCircleOutlined
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => { if (!disabled)remove(itemName); }}
      />
    </div>
  );
}

interface TagFormProps {
  disabled?: boolean;
  valueType?: ValueType;
  form: FormInstance;
}

export const TagFormItems = (props: TagFormProps) => {
  const { disabled = false, valueType = ValueType.Single, form } = props;

  const [metaKeys, setMetaKeys] = useState<string[]>([]);

  useRequest(getMetaTagKeys, {
    onSuccess: (result) => {
      const metakeys = result;
      setMetaKeys(metakeys);
    },
  });

  const { errorAlert } = useModel('alert');
  const intl = useIntl();

  return (
    <Form.List name={TagFormName}>
      {(fields, { add, remove }) => (
        <>
          {
          fields.map(({ key, name }) => (
            <Pair
              form={form}
              itemKey={key}
              itemName={name}
              metaKeys={metaKeys}
              valueType={valueType}
              remove={remove}
              disabled={disabled}
            />
          ))
        }
          {!disabled && (
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
          )}
        </>
      )}
    </Form.List>
  );
};

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
  const { successAlert } = useModel('alert');
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

  const onFinish = (v: any) => {
    update(v).then(() => {
      refresh().then();
      if (callback) {
        callback();
      }
    });
  };

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
        <Space direction="vertical" style={{ width: '100%' }}>
          <TagFormItems form={form} disabled={disabled} valueType={valueType} />
          <Form.Item>
            <Button disabled={disabled} type="primary" htmlType="submit">
              {intl.formatMessage({ id: 'pages.common.submit' })}
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
};

DynamicTagForm.defaultProps = {
  callback: () => { },
  disabled: false,
};

export default DynamicTagForm;
