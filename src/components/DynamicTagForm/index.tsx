// DynamicTagForm 返回一个标签表单，标签格式为key-value，支持动态增删
import {useModel} from "@@/plugin-model/useModel";
import {Button, Col, Form, Input, Row, Select} from "antd";
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
  disabled?: boolean
}

export default (props: Props) => {
  const [form] = Form.useForm();
  const {successAlert, errorAlert} = useModel("alert")
  const {queryTags, updateTags, valueType, callback, disabled = false} = props;

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

  const keyRuleMessage = '键是必填项，长度不超过63个字符,支持大小写字母、数字开头、横杠、斜杠、下划线、小数点的组合，且必须以大小写字母、数字开头和结尾'
  return (
    <div>
      <Row style={{marginBottom: 5}}>
        <Col span={12}>
          <span style={{color: 'red'}}>*</span> 键
        </Col>
        <Col>
          <span style={{color: 'red'}}>*</span> 值
        </Col>
      </Row>
      <Form
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
        form={form}
        layout={'vertical'}
      >
        <Form.List name="tags">
          {(fields, {add, remove}) => (
            <>
              {fields.map(({key, name}) => (
                <div key={key} style={{display: 'flex', marginBottom: 8, alignItems: "baseline"}}>
                  <Form.Item
                    style={{flex: 1}}
                    name={[name, 'key']}
                    rules={[{
                      required: true,
                      message: keyRuleMessage,
                      max: 63,
                    }, () => ({
                      validator(_, value) {
                        const arr = value.split("/")
                        if (arr.length > 2) {
                          return Promise.reject(new Error(keyRuleMessage));
                        }
                        const reg = new RegExp('^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$')
                        for (let i = 0; i < arr.length; i++) {
                          if (!arr[i] || !reg.test(arr[i])) {
                            return Promise.reject(new Error(keyRuleMessage));
                          }
                        }
                        return Promise.resolve();
                      },
                    })]}
                  >
                    <Input disabled={disabled} placeholder="key"/>
                  </Form.Item>
                  <Form.Item
                    style={{flex: 1, marginInline: '10px'}}
                    name={[name, valueKey]}
                    rules={valueRules}
                  >
                    {
                      valueType == ValueType.Multiple ? <Select disabled={disabled} mode="tags" placeholder="support multiple values"/> :
                        <Input disabled={disabled} placeholder="value"/>
                    }
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)}/>
                </div>
              ))}
              <Form.Item>
                <Button disabled={disabled} type="dashed" onClick={() => {
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
          <Button disabled={disabled} type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
