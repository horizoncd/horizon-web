import {Card, Form, Input, Select} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {useRequest} from "@@/plugin-request/request";
import {queryEnvironments, queryRegions} from "@/services/environments/environments";
import {listBranch} from "@/services/code/code";
import {queryReleases} from "@/services/templates/templates";
import HForm from '@/components/HForm'
import type {FieldData} from 'rc-field-form/lib/interface'
import {history} from "@@/core/history";

const {TextArea} = Input;
const {Option} = Select;

export default (props: any) => {
  const {readonly = false, editing = false} = props;
  const {query: q} = history.location;
  // @ts-ignore
  const {environment: envFromQuery} = q

  const intl = useIntl();

  const {data: releases} = useRequest(() => queryReleases(props.template?.name), {
    ready: !!props.template.name && !readonly
  });

  const {data: regions} = useRequest(() => queryRegions(props.form.getFieldValue('environment')), {
    ready: !!props.form.getFieldValue('environment'),
    refreshDeps: [props.form.getFieldValue('environment')]
  });

  const {data: environments} = useRequest(() => queryEnvironments());

  const {data: branchList = [], run: refreshBranchList} = useRequest((filter) => listBranch({
    giturl: props.form.getFieldValue('url'),
    filter,
    pageNumber: 1,
    pageSize: 50,
  }), {
    debounceInterval: 500,
    ready: !!props.form.getFieldValue('url') && !readonly,
  })

  const formatMessage = (suffix: string, defaultMsg?: string) => {
    return intl.formatMessage({id: `pages.clusterNew.basic.${suffix}`, defaultMessage: defaultMsg})
  }

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z0-9])(([a-z0-9][-a-z0-9]*)?[a-z0-9])?$'),
      message: formatMessage('name.ruleMessage'),
      max: 64,
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
          {item.name} <span style={{color: 'red'}}>(推荐)</span>
        </div>
      );
    }

    return item.name;
  };

  const name = editing ? <Input disabled/> :
    <Input addonBefore={`${props.applicationName}-`} placeholder={formatMessage('name.ruleMessage')}
           disabled={readonly}/>;

  return (
    <div>
      <HForm layout={'vertical'} form={props.form}
            onFieldsChange={(a: FieldData[], b: FieldData[]) => {
              props.setFormData(a, b)
            }}
            fields={props.formData}
      >
        <Card title={formatMessage('title')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('name')} name={'name'} rules={nameRules}>
            {name}
          </Form.Item>
          <Form.Item label={formatMessage('description')} name={'description'}>
            <TextArea placeholder={formatMessage('description.ruleMessage')} maxLength={255} disabled={readonly} autoSize={{minRows: 3}} />
          </Form.Item>
          <Form.Item label={formatMessage('template', '模版')}>
            <Input disabled={true} value={props.template?.name}/>
          </Form.Item>
          <Form.Item label={formatMessage('release', '模版版本')} name={'release'}>
            <Select disabled={readonly}>
              {releases?.map((item) => {
                return (
                  <Option key={item.name} value={item.name}>
                    {formatReleaseOption(item)}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('environment')} name={'environment'} rules={requiredRule}>
            <Select disabled={!!envFromQuery || readonly}>
              {environments?.map((item) => {
                return <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('region')} name={'region'} rules={requiredRule}>
            <Select disabled={readonly}>
              {regions?.map((item) => {
                return <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              })}
            </Select>
          </Form.Item>
        </Card>

        <Card title={formatMessage('repo')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('url')} name={'url'} rules={requiredRule}>
            <Input disabled={readonly}/>
          </Form.Item>
          <Form.Item label={formatMessage('subfolder')} name={'subfolder'}>
            <Input disabled={readonly}/>
          </Form.Item>
          <Form.Item label={formatMessage('branch')} name={'branch'} rules={requiredRule}>
            <Select disabled={readonly} showSearch
                    onSearch={(item) => {
                      refreshBranchList(item);
                    }}>
              {
                branchList.map((item: string) => {
                  return <Option key={item} value={item}>{item}</Option>
                })
              }
            </Select>
          </Form.Item>
        </Card>
      </HForm>
    </div>
  );
};
