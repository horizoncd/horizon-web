import {Card, Form, Input, Select} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface';
import {useRequest} from 'umi';
import {queryReleases} from '@/services/templates/templates';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {listBranch} from '@/services/code/code'

const {TextArea} = Input;
const {Option} = Select;

export default (props: any) => {
  const intl = useIntl();

  // query release version
  const {data} = useRequest(() => queryReleases(props.template?.name));
  const {data: branchList = [], run: refreshBranchList} = useRequest((giturl, filter) => listBranch({
    giturl,
    filter,
    pageNumber: 1,
    pageSize: 50,
  }), {
    manual: true,
  })

  const formatMessage = (suffix: string, defaultMsg?: string) => {
    return intl.formatMessage({id: `pages.applicationNew.basic.${suffix}`, defaultMessage: defaultMsg})
  }

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$'),
      message: formatMessage('name.ruleMessage'),
      max: 40,
    },
  ];

  const gitURLRules: Rule[] = [
    {
      pattern: new RegExp('^ssh://.+[.]git$'),
      required: true,
      message: 'Invalid! A right example: ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git',
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
          {item.name} <span style={{color: 'red'}}>(推荐)</span>
        </div>
      );
    }

    return item.name;
  };

  const {readonly = false, editing = false} = props;

  return (
    <div>
      <Form layout={'vertical'} form={props.form}
            onFieldsChange={(a, b) => {
              props.setFormData(a, b)
            }}
            fields={props.formData}
      >
        <Card title={formatMessage('title')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('name')} name={'name'} rules={nameRules}>
            <Input placeholder={formatMessage('name.ruleMessage')} disabled={readonly || editing}/>
          </Form.Item>
          <Form.Item label={formatMessage('description')} name={'description'}>
            <TextArea placeholder={formatMessage('description.ruleMessage')} maxLength={255} disabled={readonly}
                      autoSize={{minRows: 3}}/>
          </Form.Item>
          <Form.Item label={formatMessage('template', 'template')}>
            <Input disabled={true} value={props.template?.name}/>
          </Form.Item>
          <Form.Item label={formatMessage('release')} name={'release'} rules={requiredRule}>
            <Select disabled={readonly}>
              {data?.map((item) => {
                return (
                  <Option key={item.name} value={item.name}>
                    {formatReleaseOption(item)}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('priority')} name={'priority'} rules={requiredRule}>
            <Select disabled={readonly}>
              {priorities.map((item) => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Card>

        <Card title={formatMessage('repo')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('url')} name={'url'} rules={gitURLRules}>
            <Input
              placeholder="ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"
              disabled={readonly}
            />
          </Form.Item>
          <Form.Item label={formatMessage('subfolder')} name={'subfolder'}>
            <Input disabled={readonly} placeholder={"非必填，默认为项目根目录"}/>
          </Form.Item>
          <Form.Item label={formatMessage('branch')} name={'branch'} rules={requiredRule}>
            <Select placeholder="master" disabled={readonly} showSearch
                    onSearch={(item) => {
                      if (props.form.getFieldValue('url') && item) {
                        refreshBranchList(props.form.getFieldValue('url'), item);
                      }
                    }}>
              {
                branchList.map((item: string) => {
                  return <Option value={item}>{item}</Option>
                })
              }
            </Select>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};
