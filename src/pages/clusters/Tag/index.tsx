import React, {useState} from 'react';
import {useModel} from "@@/plugin-model/useModel";
import {Button, Divider, Form, Input, Space} from "antd";
import {useRequest} from "@@/plugin-request/request";
import {getClusterTags, updateClusterTags} from "@/services/clusters/clusters";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import Detail from '@/components/PageWithBreadcrumb'

export default (): React.ReactNode => {
  const [form] = Form.useForm();
  const {successAlert, errorAlert} = useModel("alert")
  const {initialState} = useModel('@@initialState');
  const {id: clusterID, name: clusterName} = initialState!.resource;
  const [tags, setTags] = useState<CLUSTER.ClusterTags>(
    {
      tags: [],
    }
  )
  const {data, run: refreshTags} = useRequest(() => {
    return getClusterTags(clusterID);
  }, {
    refreshDeps: [clusterID],
    onSuccess: () => {
      setTags(data!);
      // form.setFields(fieldData);
      form.setFieldsValue(data);
    }
  })

  const {run: updateTags} = useRequest((request) => {
    return updateClusterTags(clusterID, request)
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
    <Detail>
      <h1>{"标签管理"}</h1>
      <Divider/>
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
                <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'key']}
                    fieldKey={[fieldKey, 'key']}
                    rules={[{required: true, message: '键是必填项，长度不超过63个字符,支持大小写字母、数字开头、横杠、下划线、小数点的组合，且必须以大小写字母、数字开头和结尾', max: 63, pattern: new RegExp('^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$')}]}
                  >
                    <Input placeholder="key"/>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    fieldKey={[fieldKey, 'value']}
                    rules={[{required: true, message: '值是必填项，长度不超过512个字符', max: 512}]}
                  >
                    <Input placeholder="value"/>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)}/>
                </Space>
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
    </Detail>
  );
};
