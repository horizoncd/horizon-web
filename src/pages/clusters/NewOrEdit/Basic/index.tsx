import {Card, Form, Input, Select} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {useRequest} from "@@/plugin-request/request";
import {queryEnvironments, queryRegions} from "@/services/environments/environments";

const {TextArea} = Input;
const {Option} = Select;

export default (props: any) => {
  const intl = useIntl();

  const {data: regions, run: refreshRegions} = useRequest((env) => queryRegions(env), {
    manual: true,
  });
  const {data: environments} = useRequest(() => queryEnvironments(), {
    onSuccess: () => {
      refreshRegions(props.form.getFieldValue('env'))
    }
  });

  const formatMessage = (suffix: string, defaultMsg?: string) => {
    return intl.formatMessage({id: `pages.clusterNew.basic.${suffix}`, defaultMessage: defaultMsg})
  }

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$'),
      message: formatMessage('name.ruleMessage'),
      max: 40,
    },
  ];

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const {readonly = false, editing = false} = props;

  const name = editing ? <Input disabled/> : <Input addonBefore={`${props.applicationName}-`} placeholder={formatMessage('name.ruleMessage')}  disabled={readonly}/>;

  return (
    <div>
      <Form layout={'vertical'} form={props.form}
            onFieldsChange={(a, b) => {
              // query regions when env selected
              if (a[0].name[0] === 'env') {
                refreshRegions(a[0].value)
              }
              props.setFormData(a, b)
            }}
            fields={props.formData}
      >
        <Card title={formatMessage('title')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('name')} name={'name'} rules={nameRules}>
            {name}
          </Form.Item>
          <Form.Item label={formatMessage('description')} name={'description'}>
            <TextArea placeholder={formatMessage('description.ruleMessage')} maxLength={255} disabled={readonly}
                      autoSize/>
          </Form.Item>
          <Form.Item label={formatMessage('template', 'template')}>
            <Input disabled={true} value={props.template?.name}/>
          </Form.Item>
          <Form.Item label={formatMessage('release', 'release')}>
            <Input disabled={true} value={props.template?.release}/>
          </Form.Item>
          <Form.Item label={formatMessage('env')} name={'env'} rules={requiredRule}>
            <Select disabled={readonly}>
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
            <Input disabled/>
          </Form.Item>
          <Form.Item label={formatMessage('subfolder')} name={'subfolder'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={formatMessage('branch')} name={'branch'} rules={requiredRule}>
            <Input placeholder="master" disabled={readonly}/>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};
