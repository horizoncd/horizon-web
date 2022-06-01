// DynamicTagForm 返回一个标签表单，标签格式为key-value，支持动态增删
import {useModel} from "@@/plugin-model/useModel";
import {Button, Form, Input, Select} from "antd";
import {useRequest} from "@@/plugin-request/request";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";

export enum ValueType {
  Single,
  Multiple
}

interface Props {
  // tag查询接口
  queryTags: () => Promise<any>;
  // tag更新接口
  updateTags: (param: any) => Promise<any>;
  // 标签value的类型，如果是multiple，则用select组件，否则用input
  valueType: ValueType
  // callback func after update
  callback?: () => void
}

export default (props: Props) => {
  const [form] = Form.useForm();
  const {successAlert, errorAlert} = useModel("alert")
  const {queryTags, updateTags, valueType, callback} = props;

  const {data, run: refresh} = useRequest(() => {
    return queryTags();
  }, {
    onSuccess: () => {
      form.setFieldsValue(data);
    }
  })

  const {run: update} = useRequest((request) => {
    return updateTags(request)
  }, {
    manual: true,
    onSuccess: () => {
      successAlert("标签更新成功");
    },
    onError: () => {
      successAlert("标签更新失败");
    }
  })

  const onFinish = (values: any) => {
    update(values).then(() => {
      refresh().then();
      if (callback) {
        callback()
      }
    });
  };

  const valueKey = valueType == ValueType.Multiple ? 'values' : 'value';
  const valueRules = valueType == ValueType.Multiple ? [] : [{
    required: true,
    message: '值是必填项，长度不超过1280个字符',
    max: 1280
  }];

  return (
    <Form
      name="dynamic_form_nest_item"
      onFinish={onFinish}
      autoComplete="off"
      form={form}
    >
      <Form.List name="tags">
        {(fields, {add, remove}) => (
          <>
            {fields.map(({key, name, fieldKey, ...restField}) => (
              <div key={key} style={{display: 'flex', marginBottom: 8, alignItems: "baseline"}}>
                <Form.Item
                  {...restField}
                  name={[name, 'key']}
                  fieldKey={[fieldKey, 'key']}
                  rules={[{
                    required: true,
                    message: '键是必填项，长度不超过63个字符,支持大小写字母、数字开头、横杠、下划线、小数点的组合，且必须以大小写字母、数字开头和结尾',
                    max: 63,
                    pattern: new RegExp('^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$')
                  }]}
                >
                  <Input placeholder="key"/>
                </Form.Item>
                <Form.Item
                  style={{flex: 1, marginInline: '10px'}}
                  {...restField}
                  name={[name, valueKey]}
                  fieldKey={[fieldKey, valueKey]}
                  rules={valueRules}
                >
                  {
                    valueType == ValueType.Multiple ? <Select mode="tags" placeholder="support multiple values"/> :
                      <Input placeholder="value"/>
                  }
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)}/>
              </div>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => {
                if (fields.length >= 20) {
                  errorAlert("标签最多允许创建20个")
                } else {
                  add();
                }
              }} block icon={<PlusOutlined/>}>
                添加标签
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};
