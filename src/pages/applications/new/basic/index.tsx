import { Card, Form, Input, Select } from 'antd';
import type { Rule } from 'rc-field-form/lib/interface';
import { useRequest } from 'umi';
import { queryReleases } from '@/services/templates/templates';
import styles from '../index.less';

const { TextArea } = Input;
const { Option } = Select;

export default (props: any) => {
  // query release version
  const { data } = useRequest(() => queryReleases(props.template?.name));

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$'),
      message: '应用名是必填项，支持字母、数字和中划线的组合，且必须以字母开头',
      max: 40,
    },
  ];

  const priorities = ['P0', 'P1', 'P2', 'P3'];

  const formatReleaseOption = (item: API.Release) => {
    if (item.recommended) {
      return (
        <div>
          {item.name} <span style={{ color: 'red' }}>(推荐)</span>
        </div>
      );
    }

    return item.name;
  };

  const { readonly = false } = props;

  const onValuesChange = (value: any, allValues: any) => {
    console.log(allValues);
    props.setFormData(allValues)
  }

  return (
    <div>
      <Form layout={'vertical'} form={props.form} requiredMark={'optional'} onValuesChange={onValuesChange}>
        <Card title={'Service Basic'} className={styles.gapBetweenCards}>
          <Form.Item label={'应用名'} name={'name'} rules={nameRules}>
            <Input placeholder="支持字母、数字或中划线、长度最大为40字符" disabled={readonly} />
          </Form.Item>
          <Form.Item label={'应用描述'} name={'description'}>
            <TextArea placeholder="长度上限为255个字符" maxLength={255} disabled={readonly} />
          </Form.Item>
          <Form.Item required label={'模版版本'} name={'release'} >
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
          <Form.Item required label={'应用优先级'} name={'priority'}>
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

        <Card title={'Repo'} className={styles.gapBetweenCards}>
          <Form.Item required label={'url'} name={'url'}>
            <Input
              placeholder="如 ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"
              disabled={readonly}
            />
          </Form.Item>
          <Form.Item label={'subfolder'} name={'subfolder'}>
            <Input placeholder="如 /" disabled={readonly} />
          </Form.Item>
          <Form.Item required label={'branch'} name={'branch'}>
            <Input placeholder="如 master" disabled={readonly} />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};
