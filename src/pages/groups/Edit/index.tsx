import {Button, Card, Col, Divider, Form, Input, Modal, Row} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface'
import './index.less'
import {useEffect, useState} from "react";
import {deleteGroup, getGroupByID, updateGroupDetail} from "@/services/groups/groups";
import {useModel} from "@@/plugin-model/useModel";
import {history} from "@@/core/history";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import Detail from '@/components/'
import RBAC from '@/rbac'

const {TextArea} = Input;

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert');

  const {initialState, refresh} = useModel('@@initialState');
  const {id} = initialState?.resource || {};

  const defaultDetail: API.Group = {fullName: "", fullPath: "", id: 0, name: "", path: ""}
  const [detail, setDetail] = useState<API.Group>(defaultDetail)

  useEffect(() => {
    const updateDetail = async () => {
      const {data} = await getGroupByID(id!);
      setDetail(data)
      form.setFieldsValue(data)
    }
    updateDetail();
  }, [id]);

  const formatLabel = (labelName: string) => (
    <strong>
      {labelName}
    </strong>
  );

  const groupNameLabel = formatLabel("名称");
  const groupDescLabel = formatLabel("描述");
  const groupURLLabel = formatLabel("路径");

  const getGroupNameLabelStyle = () => {
    return {
      width: '30%'
    }
  }
  const getGroupPathAndDescStyle = () => {
    return {
      width: '60%'
    }
  }
  const getSubmitBtnStyle = () => {
    return {
      width: '80%'
    }
  }

  // @ts-ignore
  const getURLPrefix = () => window.location.origin + detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)

  const onFinish = (values: API.Group) => {
    updateGroupDetail(id!, values).then(() => {
      successAlert('分组修改成功');
      const newFullPath = `${detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)}${values.path}`;
      history.replace(`/groups${newFullPath}/-/edit`)
      refresh()
    })
  }

  const nameRules: Rule[] = [{
    required: true,
    message: 'name required, max length: 64',
    max: 64,
  }];

  const pathRegx = new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$')

  const pathRules: Rule[] = [
    {
      required: true,
      pattern: pathRegx,
      message: 'URL是必填项，只支持小写字母、数字和中划线的组合，且必须以字母开头',
    },
  ];

  const onDelete = () => {
    deleteGroup({id: detail.id}).then(() => {
      successAlert('分组删除成功')
      history.push('/');
    });
  }

  return (
    <PageWithBreadcrumb>
        <h1>{'分组配置'}</h1>
        <Divider/>
      <Card>
          <Form
            layout={'vertical'}
            form={form}
            onFinish={onFinish}
            onFieldsChange={(a, b) => {
              // query regions when environment selected
              if (a[0].name[0] === 'name') {
                if (pathRegx.test(a[0].value)) {
                  for (let i = 0; i < b.length; i++) {
                    if (b[i].name[0] === 'path') {
                      b[i].value = a[0].value
                    }
                  }
                  form.setFields(b)
                  form.validateFields(['path'])
                }
              }
            }}
          >
            <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
              <Input disabled={!RBAC.Permissions.updateGroup.allowed} style={getGroupNameLabelStyle()}
                     placeholder="My awesome group"/>
            </Form.Item>
            <Form.Item label={groupDescLabel} name={'description'}>
              <TextArea disabled={!RBAC.Permissions.updateGroup.allowed} style={getGroupPathAndDescStyle()} allowClear
                        autoSize={{minRows: 3}} maxLength={255}/>
            </Form.Item>
            <Form.Item label={groupURLLabel} name={'path'} rules={pathRules}>
              <Input disabled={!RBAC.Permissions.updateGroup.allowed} addonBefore={getURLPrefix()}
                     style={{width: '100%'}}/>
            </Form.Item>
            {
              RBAC.Permissions.updateGroup.allowed && <Form.Item style={getSubmitBtnStyle()}>
                <Button type="primary" htmlType={'submit'}>保存</Button>
              </Form.Item>
            }
          </Form>
      </Card>
          {RBAC.Permissions.deleteGroup.allowed && <Divider/>}
          {
            RBAC.Permissions.deleteGroup.allowed && <Card className={'card'}>
              <Button style={{backgroundColor: '#dd2b0e', color: 'white'}} onClick={() => {
                Modal.confirm({
                  title: '删除分组前，请确认子分组和应用已全被删除',
                  icon: <ExclamationCircleOutlined/>,
                  okText: '删除',
                  cancelText: '取消',
                  onOk: onDelete,
                });
              }}>删除分组</Button>
              <span style={{fontWeight: 'bold', marginLeft: '20px'}}>分组删除后，将无法恢复!</span>
            </Card>
          }
    </PageWithBreadcrumb>
  );
};
