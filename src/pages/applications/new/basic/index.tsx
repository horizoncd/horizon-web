import { Card, Form, Input, Select } from "antd";
import type { Rule } from "rc-field-form/lib/interface";
import { useRequest } from 'umi';
import { queryReleases } from "@/services/templates/templates";

const { TextArea } = Input;
const { Option } = Select;

export default (props: any) => {

  // query release version
  const { data } = useRequest(() => queryReleases(props.template?.name))

  const nameRules: Rule[] = [{
    required: true,
    pattern: new RegExp('^[a-z][a-z0-9-]*$'),
    message: '应用名是必填项，支持字母、数字和中划线的组合，且必须以字母开头',
    max: 40,
  }];

  return (
    <div>
      <Form
        layout={ 'vertical' }
        form={ props.form }
        requiredMark={ 'optional' }
      >
        <Card title={ 'Service Basic' }>
          <Form.Item label={ '应用名' } name={ 'name' } rules={ nameRules }>
            <Input placeholder="支持字母、数字或中划线、长度最大为40字符"/>
          </Form.Item>
          <Form.Item label={ '应用描述' } name={ 'description' }>
            <TextArea placeholder="长度上限为255个字符" maxLength={255}/>
          </Form.Item>
          <Form.Item required label={ '模版版本' }>
            <Select onSelect={props.setRelease} value={props.release} >
              {
                data?.map(item => {
                  return <Option key={ item.name } value={ item.name }>{ item.name }</Option>;
                })
              }
            </Select>
          </Form.Item>
        </Card>

        <Card title={ 'Repo' } style={ { marginTop: '20px' } }>
          <Form.Item required label={ 'url' } name={ 'url' }>
            <Input placeholder="如 ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"/>
          </Form.Item>
          <Form.Item label={ 'subfolder' } name={ 'subfolder' }>
            <Input placeholder="如 /"/>
          </Form.Item>
          <Form.Item required label={ 'branch' } name={ 'branch' }>
            <Input placeholder="如 master"/>
          </Form.Item>
        </Card>
      </Form>
    </div>
  )
}
