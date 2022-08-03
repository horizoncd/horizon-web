import {Col, Form, Input, Row, Button} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {TemplateForm, ReleaseForm} from '../components/form'
import {createTemplate} from "@/services/templates/templates";
import {TagSelector} from "../components/tagSelector";
import {NotFount} from "@/components/State";
import {useState} from "react";
import rbac from "@/rbac";

export default () => {
  const {initialState} = useModel('@@initialState')
  if(!initialState || !initialState.currentUser) {
    return <NotFount/>
  }

  const isAdmin: boolean = initialState.currentUser.isAdmin
  let groupID = 0
  if(history.location.pathname !== '/templates/new') {
    groupID = initialState?.resource.id
  }
  const fullName = initialState?.resource.fullName
  
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  // const repository = Form.useWatch('repository', form);
  const [repo, setRepo] = useState('')
  const pattern = new RegExp('^(?:http(?:s?)|ssh)://.+?/(.+?)(?:.git)?$')

  const updateRepo = (s: string) => {
    if(pattern.test(s)) {
      setRepo(s)
    }
  }

  const Release = (props: {repository: any}) => {
    if ( typeof props.repository === 'string' && props.repository !== "") {
      return <><TagSelector prefix={["release"]} repository={props.repository}/>
            <ReleaseForm isAdmin={isAdmin} prefix={["release"]}/></> 
    }
    return <></>
  }

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            createTemplate(groupID,v).then(({data: {name}}) => {
              successAlert('Template 创建成功')
              if(fullName === '') {
                history.push(`/templates/${name}/-/detail`)
              }else{
                window.location.href = `/templates/${fullName}/${name}/-/detail`
              }
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} required={true} extra={'Templates唯一名称标识'}>
            <Input/>
          </Form.Item>
          <TemplateForm onRepositoryBlur={updateRepo} isAdmin={initialState.currentUser.isAdmin}/>

          <Release repository={repo} />

          <Form.Item>
            <Button type="primary" disabled={!rbac.Permissions.createTemplate.allowed}
             htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
