import {
  AutoComplete,
  Card, Form, FormInstance, Input, Select,
} from 'antd';
import { useModel, useRequest } from 'umi';
import type { FieldData, Rule } from 'rc-field-form/lib/interface';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useEffect, useState } from 'react';
import { history } from '@@/core/history';
import {
  ResourceKey, AppOrClusterType, gitURLRegExp, ClusterStatus,
} from '@/const';
import HForm from '@/components/HForm';
import { TagFormItems, ValueType } from '@/components/tag';
import { MaxSpace } from '@/components/Widget';
import { queryRegions } from '@/services/applications/applications';
import { queryEnvironments } from '@/services/environments/environments';
import { listGitRef, GitRefType, gitRefTypeList } from '@/services/code/code';

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  form: FormInstance;
  appName: string;
  clusterType: AppOrClusterType;
  clusterStatus?: string;
  readOnly?: boolean;
  editing?: boolean;
  setValid?: (valid: boolean) => void;
  onEnvChange?: (value: string) => void;
}

const BaseInfoForm: React.FC<Props> = (props: Props) => {
  const {
    form,
    appName,
    clusterType = AppOrClusterType.GIT_IMPORT,
    clusterStatus = '',
    readOnly = false,
    editing = false,
    setValid = () => {},
    onEnvChange = () => {},
  } = props;

  const { query: q } = history.location;
  // @ts-ignore
  const { environment: envFromQuery } = q;
  const { initialState } = useModel('@@initialState');
  const { id, parentID } = initialState!.resource;

  const intl = useIntl();
  const [initValidation, setInitValidation] = useState(true);

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({
    id: `pages.clusterNew.basic.${suffix}`,
    defaultMessage: defaultMsg,
  });

  // query application's selectable regions when creating cluster
  const applicationID = editing ? parentID : id;
  const { data: regions } = useRequest(() => queryRegions(applicationID, form.getFieldValue(ResourceKey.ENVIRONMENT)), {
    ready: !!form.getFieldValue(ResourceKey.ENVIRONMENT),
    refreshDeps: [form.getFieldValue(ResourceKey.ENVIRONMENT)],
    onSuccess: () => {
      if (!editing && regions) {
        // put default region on top of the list
        regions.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        // put disabled regions on bottom of the list
        regions.sort((a, b) => Number(a.disabled) - Number(b.disabled));
        if (!form.getFieldValue(ResourceKey.REGION)) {
          regions.forEach((r) => {
            if (r.isDefault && !r.disabled) {
              form.setFields([{
                name: [ResourceKey.REGION], value: r.name, errors: [],
              }]);
            }
          });
        }
      }
    },
  });

  const { data: environments } = useRequest(() => queryEnvironments());
  const envAutoFreeFlags = new Map<string, boolean>();
  environments?.forEach((item) => envAutoFreeFlags.set(item.name, item.autoFree));

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
  const imageUrlRules: Rule[] = [
    {
      pattern: /^([a-z0-9]+(?:[._-][a-z0-9]+)*\/)?([a-z0-9]+(?:[._-][a-z0-9]+)*\/)*([a-z0-9]+(?:[._-][a-z0-9]+)*)(?::([a-z0-9]+(?:[._-][a-z0-9]+)*))?(?:@([a-z0-9]+(?:[._-][a-z0-9]+)*))?$/,
      required: true,
      message: formatMessage('image.ruleMessage'),
    },
  ];

  const name = (
    editing ? <Input disabled />
      : (
        <Input
          key={appName}
          defaultValue={`${appName}-`}
          placeholder={formatMessage('name.ruleMessage')}
          disabled={readOnly}
        />
      )
  );

  // provide expiryDay from 1 to 7 days, and 14 days for special test clusters.
  const expireTimeOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 14];

  const autoFreeDisabled = () => {
    const environmentName = form.getFieldValue('environment');
    if (environmentName) {
      return !envAutoFreeFlags.get(environmentName);
    }
    return true;
  };

  const fieldsToValidate = [
    ResourceKey.NAME, ResourceKey.ENVIRONMENT,
  ];
  if (clusterType === AppOrClusterType.GIT_IMPORT) {
    fieldsToValidate.push(ResourceKey.GIT_URL, ResourceKey.GIT_REF_VALUE);
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
            {name}
          </Form.Item>
          <Form.Item label={formatMessage('description')} name="description">
            <TextArea
              placeholder={formatMessage('description.ruleMessage')}
              maxLength={255}
              disabled={readOnly}
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
          <Form.Item label={formatMessage('environment')} name="environment" rules={requiredRule}>
            <Select disabled={!!envFromQuery || readOnly || editing} onChange={onEnvChange}>
              {environments?.map((item) => (
                <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('region')} name="region" rules={requiredRule}>
            <Select disabled={readOnly || (editing && clusterStatus !== ClusterStatus.FREED)}>
              {regions?.map((item) => {
                const defaultText = item.isDefault ? `${item.displayName} (default)` : item.displayName;
                const text = item.disabled ? `${defaultText} (disabled)` : defaultText;
                return (
                  <Option key={item.name} value={item.name} disabled={item.disabled}>
                    {text}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          {
            autoFreeDisabled()
          || (
            <Form.Item
              label={formatMessage('expireTime')}
              name="expireTime"
              rules={requiredRule}
              initialValue={`${expireTimeOptions[2] * 24}h0m0s`}
              extra={intl.formatMessage({ id: 'pages.message.expireTime.hint' })}
            >
              <Select
                disabled={readOnly}
              >
                {expireTimeOptions?.map((item) => (
                  <Option
                    key={item}
                    value={`${item * 24}h0m0s`}
                  >
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )
          }
        </Card>
        <Card title={(
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
        {clusterType === AppOrClusterType.GIT_IMPORT && (
          <Card title={formatMessage('repo')}>
            <Form.Item label={formatMessage('url')} name="url" rules={gitURLRules}>
              <Input disabled={readOnly} />
            </Form.Item>
            <Form.Item label={formatMessage('subfolder')} name="subfolder">
              <Input disabled={readOnly} />
            </Form.Item>
            <Form.Item
              label={formatMessage('revision')}
              name="revision"
              rules={requiredRule}
            >
              <Input.Group compact>
                <Form.Item
                  name="refType"
                  rules={[{ required: true, message: formatMessage('refType.ruleMessage') }]}
                >
                  <Select
                    disabled={readOnly}
                    defaultValue={gitRefTypeList[0]}
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
                  name="refValue"
                  rules={[{ required: true, message: formatMessage('refValue.ruleMessage') }]}
                  style={{ display: 'inline-block', width: 'calc(100% - 100px)' }}
                >
                  {
                  form.getFieldValue('refType') === GitRefType.Commit
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
              </Input.Group>
            </Form.Item>
          </Card>
        )}
        {clusterType === AppOrClusterType.IMAGE_DEPLOY && (
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
