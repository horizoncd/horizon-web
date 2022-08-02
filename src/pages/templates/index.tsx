import {Space,Button,Table, Row, Col,Tabs, Popover} from "antd";
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {history} from "@@/core/history";
import {getTemplates, queryTemplates} from "@/services/templates/templates"
import {useModel} from "umi";
import type {API} from "@/services/typings";
import {ResourceType} from "@/const";
import {NotFount} from "@/components/State";
import RBAC from '@/rbac'
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {hasPermission} from "./utils";

const {TabPane} = Tabs

export default () => {
  const {initialState,loading} = useModel('@@initialState')
  const currentUser = initialState?.currentUser as API.CurrentUser;
  
  if(loading) {
    return <></>
  }
  if(!initialState) {
    return <NotFount/>
  }

  const {type,fullName,id} = initialState?.resource;
  const isRootPage = !(type === ResourceType.GROUP && history.location.pathname !== '/templates')
  const {data: templates} = useRequest(() => {
    if(!isRootPage) {
      return getTemplates(id,true)
    }
    return queryTemplates(true)
  } , {});

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, t: Templates.Template) => {
        return <Space size="middle">
          <a href={`/templates${t.fullpath}/-/detail`}>{name}</a>
        </Space>
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (desc: string) => {
        if (desc.length < 50) {
          return desc
        }
        return   <Popover content={desc} >
          {desc.substring(0,50)+'...'}
  </Popover>
      }
    }
  ]
  let queryInput = <Button
        type="primary"
        style={{marginBottom: 10, float: 'right', marginRight: 5}}
        onClick={() => {
          history.push(`/templates/new`)
        }}
      >
        创建templates
      </Button>
  if(isRootPage) {
    queryInput = currentUser.isAdmin ? queryInput : <></>
  }else{
    queryInput = hasPermission(currentUser,RBAC.Permissions.createTemplate.allowed) ? 
      <Button
        type="primary"
        style={{marginBottom: 10, float: 'right', marginRight: 5}}
        onClick={() => {
          history.push(`/groups/${fullName}/-/newtemplate`)
        }}
      >
        创建templates
      </Button>
     : <></>
  }

  const locale = {
    emptyText: <NoData title={'templates'} desc={
      'template是horizon创建application/cluster的模板，包含了CI/CD流程'}
    />
  }

  const table = <Table
    rowKey={'id'}
    columns={columns}
    dataSource={templates}
    locale={locale}
    pagination={{
      position: ['bottomCenter'],
      hideOnSinglePage: true,
      total: templates?.length,
      pageSize: 10 
    }}
  />

    const result = <Row>
      <Col span={4} />
      <Col span={16}>
        <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={queryInput}
              animated={false} style={{marginTop: '15px'}}>
          <TabPane tab="All Templates" key="1">
            {table}
          </TabPane>
        </Tabs>
      </Col>
    </Row>

    if(isRootPage) {
      return result
    }else{
      return <PageWithBreadcrumb>
        {result}
      </PageWithBreadcrumb>
    }
}
