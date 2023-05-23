import {
  AutoComplete,
  Card, Form, Input, Select,
} from 'antd';
import type { FieldData, Rule } from 'rc-field-form/lib/interface';
import { useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { queryReleases } from '@/services/templates/templates';
import styles from '@/pages/applications/NewOrEdit/index.less';
import { GitRefType, listGitRef } from '@/services/code/code';
import { pipelineV2 } from '@/services/version/version';
import { gitURLRegExp } from '@/const';

import HForm from '@/components/HForm';
import { TagFormItems, ValueType } from '@/components/tag';

const { TextArea } = Input;
const { Option } = Select;

export default (props: any) => {
  const {
    form, template, readOnly = false, editing = false, formData, setFormData, version,
  } = props;
  const intl = useIntl();

  const { data: releases } = useRequest(
    () => queryReleases(template?.name),
    { ready: template !== undefined },
  );
  const { data: gitRefList = [], run: refreshGitRefList } = useRequest((filter?: string) => {
    const giturl = form.getFieldValue('url');
    const refType = form.getFieldValue('refType');
    return listGitRef({
      refType,
      giturl,
      filter: filter ?? '',
      pageNumber: 1,
      pageSize: 50,
    });
  }, {
    debounceInterval: 100,
    ready: !!form.getFieldValue('url') && !readOnly,
  });

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({
    id: `pages.applicationNew.basic.${suffix}`,
    defaultMessage: defaultMsg,
  });

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

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const priorities = ['P0', 'P1', 'P2', 'P3'];

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

  const gitRefTypeList = [
    {
      displayName: 'Branch',
      key: 'branch',
    },
    {
      displayName: 'Tag',
      key: 'tag',
    },
    {
      displayName: 'Commit',
      key: 'commit',
    },
  ];

  return (
    <div>
      <HForm
        layout="vertical"
        form={form}
        onFieldsChange={(a: FieldData[], b: FieldData[]) => {
          setFormData(a, b.filter((item) => item.name[0] !== 'tags'));
        }}
        fields={formData}
      >
        <Card title={formatMessage('title')} className={styles.gapBetweenCards}>
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
          {
            version !== pipelineV2 && (
              <div>
                <Form.Item label={formatMessage('template')}>
                  <Input disabled value={template?.name} />
                </Form.Item>
                <Form.Item label={formatMessage('release')} name="release" rules={requiredRule}>
                  <Select disabled={readOnly}>
                    {releases?.map((item: { name: any; description?: string; recommended?: boolean; }) => (
                      <Option key={item.name} value={item.name}>
                        {formatReleaseOption(item)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            )
          }

          <Form.Item label={formatMessage('priority')} name="priority" rules={requiredRule}>
            <Select disabled={readOnly}>
              {priorities.map((item) => (
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
          className={styles.gapBetweenCards}
        >
          <TagFormItems form={form} disabled={readOnly} valueType={ValueType.Single} />
        </Card>

        <Card title={formatMessage('repo')}>
          <Form.Item label={formatMessage('url')} name="url" rules={gitURLRules}>
            <Input
              placeholder="ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"
              disabled={readOnly}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage('revision')}
            name="refType"
            rules={gitRevisionRules}
          >
            <Form.Item
              name="refType"
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
              name="refValue"
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
          </Form.Item>
          <Form.Item label={formatMessage('subfolder')} name="subfolder">
            <Input disabled={readOnly} placeholder={readOnly ? '' : intl.formatMessage({ id: 'pages.message.subfolder.hint' })} />
          </Form.Item>
        </Card>
      </HForm>
    </div>
  );
};
