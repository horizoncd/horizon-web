import { Card, Form, Input } from 'antd';
import type { Rule } from 'rc-field-form/lib/interface';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";

const { TextArea } = Input;

export default (props: any) => {
  const intl = useIntl();

  const formatMessage = (suffix: string) => {
    return intl.formatMessage({ id: `pages.clusterNew.basic.${suffix}` })
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

  const { readonly = false, editing = false } = props;

  return (
    <div>
      <Form layout={ 'vertical' } form={ props.form } requiredMark={ 'optional' }
            onFieldsChange={ (a, b) => {
              props.setFormData(a, b)
            } }
            fields={props.formData}
      >
        <Card title={ formatMessage('title') } className={ styles.gapBetweenCards }>
          <Form.Item label={ formatMessage('name') } name={ 'name' } rules={ nameRules }>
            <Input placeholder={formatMessage('name.ruleMessage')} disabled={ readonly || editing }/>
          </Form.Item>
          <Form.Item label={ formatMessage('description') } name={ 'description' }>
            <TextArea placeholder={formatMessage('description.ruleMessage')} maxLength={ 255 } disabled={ readonly }/>
          </Form.Item>
        </Card>

        <Card title={ formatMessage('repo') } className={ styles.gapBetweenCards }>
          <Form.Item label={ formatMessage('branch') } name={ 'branch' } rules={ requiredRule }>
            <Input placeholder="master" disabled={ readonly }/>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};
