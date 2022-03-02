// DynamicTagForm 返回一个标签表单，标签格式为key-value，支持动态增删
import {useModel} from "@@/plugin-model/useModel";
import {Button, Form, Input, Space} from "antd";
import {useRequest} from "@@/plugin-request/request";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";

interface Props {
  // tag查询接口
  queryTags: (clusterID: number) => Promise<any>;
  // tag更新接口
  updateTags: (clusterID: number, param: any) => Promise<any>;
}

export default (props: Props) => {
  const [form] = Form.useForm();
  const {successAlert, errorAlert} = useModel("alert")
  const {initialState} = useModel('@@initialState');
  const {id: clusterID} = initialState!.resource;
  const {data, run: refreshTags} = useRequest(() => {
    return props.queryTags(clusterID);
  }, {
    refreshDeps: [clusterID],
    onSuccess: () => {
      form.setFieldsValue(data);
    }
  })

  const {run: updateTags} = useRequest((request) => {
    return props.updateTags(clusterID, request)
  }, {
    manual: true,
    onSuccess: () => {
      successAlert("标签更新成功");
    },
    onError: () => {
      successAlert("标签更新失败");
    }
  })

  const onFinish = (values: CLUSTER.ClusterTags) => {
    updateTags(values).then(() => {
      refreshTags().then();
    });
  };

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
                  name={[name, 'value']}
                  fieldKey={[fieldKey, 'value']}
                  rules={[{required: true, message: '值是必填项，长度不超过1280个字符', max: 1280}]}
                >
                  <Input placeholder="value"/>
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
