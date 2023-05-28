import {
  AutoComplete,
  Card, Form, FormInstance, Input, Select,
} from 'antd';
import { useRequest } from 'umi';
import type { FieldData, Rule } from 'rc-field-form/lib/interface';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useEffect, useState } from 'react';
import {
  Priorities, ResourceKey, AppOrClusterType, gitURLRegExp,
} from '@/const';
import { GitRefType, listGitRef, gitRefTypeList } from '@/services/code/code';
import HForm from '@/components/HForm';
import { TagFormItems, ValueType } from '@/components/tag';
import { MaxSpace } from '@/components/Widget';

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  form: FormInstance;
  appType: AppOrClusterType;
  readOnly?: boolean;
  editing?: boolean;
  setValid?: (valid: boolean) => void;
}

const BaseInfoForm: React.FC<Props> = (props: Props) => {
  const {
    form,
    appType = AppOrClusterType.GIT_IMPORT,
    readOnly = false,
    editing = false,
    setValid = () => {},
  } = props;
  const intl = useIntl();
  const [initValidation, setInitValidation] = useState(true);

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({
    id: `pages.applicationNew.basic.${suffix}`,
    defaultMessage: defaultMsg,
  });

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];
  const nameRules: Rule[] = [
    {
      required: true,
      pattern: /^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$/,
      message: formatMessage('name.ruleMessage'),
      max: 64,
    },
  ];
  const gitURLRules: Rule[] = [
    {
      pattern: gitURLRegExp,
      required: true,
      message: formatMessage('url.ruleMessage'),
      max: 128,
    },
  ];
  const gitRevisionRules: Rule[] = [
    {
      max: 128,
    },
  ];
  const imageUrlRules: Rule[] = [
    {
      pattern: /^([a-z0-9]+(?:[._-][a-z0-9]+)*\/)?([a-z0-9]+(?:[._-][a-z0-9]+)*\/)*([a-z0-9]+(?:[._-][a-z0-9]+)*)(?::([a-z0-9]+(?:[._-][a-z0-9]+)*))?(?:@([a-z0-9]+(?:[._-][a-z0-9]+)*))?$/,
      required: true,
      message: formatMessage('image.ruleMessage'),
    },
  ];

  const fieldsToValidate = [
    ResourceKey.NAME, ResourceKey.PRIORITY,
  ];
  if (appType === AppOrClusterType.GIT_IMPORT) {
    fieldsToValidate.push(ResourceKey.GIT_URL);
  } else {
    fieldsToValidate.push(ResourceKey.IMAGE_URL);
  }

  const isFieldsValid = (fields: FieldData[]) => {
    if (editing && fields.length === 0) {
      return true;
    }
    let valid = false;
    let validatedNum = 0;
    for (let i = 0; i < fields!.length; i += 1) {
      const val = fields![i];
      if (val.errors && val.errors.length > 0) {
        break;
      }
      if (val.name.length > 0 && fieldsToValidate.includes(val.name[0]) && val.value) {
        validatedNum += 1;
      }
    }
    if (validatedNum === fieldsToValidate.length) {
      valid = true;
    }
    return valid;
  };

  useEffect(() => {
    if (initValidation && editing) {
      setValid(true);
      setInitValidation(false);
    }
  }, [initValidation, editing, setValid]);

  const { data: gitRefList = [], run: refreshGitRefList } = useRequest((filter?: string) => {
    const giturl = form.getFieldValue(ResourceKey.GIT_URL);
    const refType = form.getFieldValue(ResourceKey.GIT_REF_TYPE);
    return listGitRef({
      refType,
      giturl,
      filter: filter ?? '',
      pageNumber: 1,
      pageSize: 50,
    });
  }, {
    debounceInterval: 100,
    ready: !!form.getFieldValue(ResourceKey.GIT_URL) && !readOnly,
  });

  return (
    <HForm
      layout="vertical"
      form={form}
      onFieldsChange={(_changedFields: FieldData[], allFields: FieldData[]) => {
        const valid = isFieldsValid(allFields);
        // console.log('baseInfo validated: ', validated);
        setValid(valid);
      }}
    >
      <MaxSpace
        direction="vertical"
        size="middle"
      >
        <Card title={formatMessage('title')}>
          <Form.Item label={formatMessage('name')} name="name" rules={nameRules}>
            <Input placeholder={formatMessage('name.ruleMessage')} disabled={readOnly || editing} />
          </Form.Item>
          <Form.Item label={formatMessage('description')} name="description">
            <TextArea
              placeholder={readOnly ? '' : formatMessage('description.ruleMessage')}
              maxLength={255}
              disabled={readOnly}
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
          <Form.Item label={formatMessage('priority')} name="priority" rules={requiredRule}>
            <Select disabled={readOnly}>
              {Priorities.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
        <Card
          title={(
            <>
              <div>
                {intl.formatMessage({ id: 'pages.tags.normal' })}
              </div>
              <div style={{ fontSize: '13px', color: 'gray' }}>
                {intl.formatMessage({ id: 'pages.tags.description' })}
              </div>
            </>
          )}
        >
          <TagFormItems form={form} disabled={readOnly} valueType={ValueType.Single} />
        </Card>
        {appType === AppOrClusterType.GIT_IMPORT && (
          <Card title={formatMessage('repo')}>
            <Form.Item
              label={formatMessage('url')}
              name={ResourceKey.GIT_URL}
              rules={gitURLRules}
            >
              <Input
                placeholder="ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"
                disabled={readOnly}
              />
            </Form.Item>
            <Form.Item
              label={formatMessage('revision')}
              name={ResourceKey.GIT_REF_TYPE}
              rules={gitRevisionRules}
            >
              <Form.Item
                name={ResourceKey.GIT_REF_TYPE}
                style={{ display: 'inline-block', width: '100px' }}
                initialValue={gitRefTypeList[0].key}
              >
                <Select
                  disabled={readOnly}
                  onSelect={(key: any) => {
                    if (key !== GitRefType.Commit) {
                      refreshGitRefList();
                    }
                  }}
                >
                  {
                    gitRefTypeList.map((item) => <Option key={item.key} value={item.key}>{item.displayName}</Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item
                name={ResourceKey.GIT_REF_VALUE}
                style={{ display: 'inline-block', width: 'calc(100% - 100px)' }}
              >
                {
                  form.getFieldValue(ResourceKey.GIT_REF_TYPE) === GitRefType.Commit
                    ? <Input /> : (
                      <AutoComplete
                        disabled={readOnly}
                        showSearch
                        onSearch={(item) => {
                          refreshGitRefList(item);
                        }}
                      >
                        {
                          gitRefList.map((item: string) => <AutoComplete.Option key={item} value={item}>{item}</AutoComplete.Option>)
                        }
                      </AutoComplete>
                    )
                }
              </Form.Item>
            </Form.Item>
            <Form.Item label={formatMessage('subfolder')} name={ResourceKey.GIT_SUB_FOLDER}>
              <Input disabled={readOnly} placeholder={readOnly ? '' : intl.formatMessage({ id: 'pages.message.subfolder.hint' })} />
            </Form.Item>
          </Card>
        )}
        {appType === AppOrClusterType.IMAGE_DEPLOY && (
          <Card title={formatMessage('image')}>
            <Form.Item
              label={formatMessage('url')}
              name={ResourceKey.IMAGE_URL}
              rules={imageUrlRules}
            >
              <Input
                placeholder="horizon-core:v1.0.0"
                disabled={readOnly}
              />
            </Form.Item>
          </Card>
        )}
      </MaxSpace>
    </HForm>
  );
};

export default BaseInfoForm;
