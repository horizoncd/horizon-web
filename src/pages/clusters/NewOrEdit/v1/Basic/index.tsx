import {
  Card, Form, Input, Select,
} from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useRequest } from '@@/plugin-request/request';
import type { FieldData } from 'rc-field-form/lib/interface';
import { history } from '@@/core/history';
import { useModel } from '@@/plugin-model/useModel';
import { Rule } from 'antd/lib/form';
import { useCallback, useState } from 'react';
import { queryEnvironments } from '@/services/environments/environments';
import { listGitRef, GitRefType, gitRefTypeList } from '@/services/code/code';
import { queryReleases } from '@/services/templates/templates';
import HForm from '@/components/HForm';
import { queryRegions } from '@/services/applications/applications';
import { ClusterStatus } from '@/const';
import { MaxSpace } from '@/components/Widget';
import { gitURLRegExp } from '@/const';
import { TagFormItems, ValueType } from '@/components/tag';
import { TagFormName } from '@/components/tag/DynamicTagForm';

const { TextArea } = Input;
const { Option } = Select;

export default (props: any) => {
  const {
    template, form, applicationName, formData, setFormData, status,
  } = props;
  const { readOnly = false, editing = false } = props;
  const { query: q } = history.location;
  // @ts-ignore
  const { environment: envFromQuery } = q;
  const { initialState } = useModel('@@initialState');
  const { id, parentID } = initialState!.resource;
  const [autoFreeFlags, setAutoFreeFlags] = useState<Map<string, boolean>>(new Map());
  const intl = useIntl();

  const { data: releases } = useRequest(() => queryReleases(template?.name), {
    ready: !!template && !!template.name && !readOnly,
  });

  // query application's selectable regions when creating cluster
  const applicationID = editing ? parentID : id;
  const { data: regions } = useRequest(() => queryRegions(applicationID, form.getFieldValue('environment')), {
    ready: !!form.getFieldValue('environment'),
    refreshDeps: [form.getFieldValue('environment')],
    onSuccess: () => {
      if (regions) {
        const m = new Map<string, boolean>();
        regions.forEach((r) => {
          m.set(r.name, r.autoFree);
        });
        setAutoFreeFlags(m);

        if (!editing) {
        // put default region on top of the list
          regions.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
          // put disabled regions on bottom of the list
          regions.sort((a, b) => Number(a.disabled) - Number(b.disabled));
          if (!form.getFieldValue('region')) {
            regions.forEach((r) => {
              if (r.isDefault && !r.disabled) {
                form.setFields([{
                  name: ['region'], value: r.name, errors: [],
                }]);
              }
            });
          }
        }
      }
    },
  });

  const { data: environments } = useRequest(() => queryEnvironments());

  const { data: gitRefList = [], run: refreshGitRefList } = useRequest((filter?: string) => {
    const giturl = form.getFieldValue('url');
    const refType = form.getFieldValue('refType');
    return listGitRef({
      refType,
      giturl,
      filter,
      pageNumber: 1,
      pageSize: 50,
    });
  }, {
    debounceInterval: 100,
    ready: !!form.getFieldValue('url') && !readOnly,
  });

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({ id: `pages.clusterNew.basic.${suffix}`, defaultMessage: defaultMsg });

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: /^(?=[a-z0-9])(([a-z0-9][-a-z0-9]*)?[a-z0-9])?$/,
      message: formatMessage('name.ruleMessage'),
      max: 64,
    },
  ];

  const urlRules: Rule[] = [
    {
      pattern: gitURLRegExp,
      required: true,
      message: formatMessage('url.ruleMessage'),
      max: 128,
    },
  ];

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const formatReleaseOption = (item: API.Release) => {
    if (item.recommended) {
      return (
        <div>
          {item.name}
          {' '}
          <span style={{ color: 'red' }}>{intl.formatMessage({ id: 'pages.common.recommend' })}</span>
        </div>
      );
    }

    return item.name;
  };

  const name = (
    editing ? <Input disabled />
      : (
        <Input
          key={applicationName}
          defaultValue={`${applicationName}-`}
          placeholder={formatMessage('name.ruleMessage')}
          disabled={readOnly}
        />
      )
  );

  // provide expiryDay from 1 to 7 days, and 14 days for special test clusters.
  const expireTimeOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 14];

  const autoFreeDisabled = useCallback(() => {
    const regionName = form.getFieldValue('region');
    if (regionName) {
      return !autoFreeFlags.get(regionName);
    }
    return true;
  }, [autoFreeFlags, form]);

  return (
    <div>
      <HForm
        layout="vertical"
        form={form}
        onFieldsChange={(a: FieldData[], b: FieldData[]) => {
          setFormData(a, b.filter((item) => item.name[0] !== TagFormName));
        }}
        fields={formData}
      >
        <MaxSpace
          direction="vertical"
          size="middle"
          style={{ display: 'flex' }}
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
            <Form.Item label={formatMessage('template')}>
              <Input disabled value={template?.name} />
            </Form.Item>
            <Form.Item label={formatMessage('release')} name="release">
              <Select disabled={readOnly}>
                {releases?.map((item: any) => (
                  <Option key={item.name} value={item.name}>
                    {formatReleaseOption(item)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage('environment')} name="environment" rules={requiredRule}>
              <Select disabled={!!envFromQuery || readOnly || editing}>
                {environments?.map((item) => (
                  <Option key={item.name} value={item.name}>
                    {item.displayName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={formatMessage('region')} name="region" rules={requiredRule}>
              <Select disabled={readOnly || (editing && status !== ClusterStatus.FREED)}>
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

          <Card title={formatMessage('repo')}>
            <Form.Item label={formatMessage('url')} name="url" rules={urlRules}>
              <Input disabled={readOnly} />
            </Form.Item>
            <Form.Item label={formatMessage('subfolder')} name="subfolder">
              <Input disabled={readOnly} />
            </Form.Item>
            <Form.Item
              label={formatMessage('revision')}
              rules={[{ required: true }]}
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
                      <Select
                        disabled={readOnly}
                        showSearch
                        onSearch={(item) => {
                          refreshGitRefList(item);
                        }}
                      >
                        {
                        gitRefList.map((item: string) => <Option key={item} value={item}>{item}</Option>)
                      }
                      </Select>
                    )
                }
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Card>
        </MaxSpace>
      </HForm>
    </div>
  );
};
