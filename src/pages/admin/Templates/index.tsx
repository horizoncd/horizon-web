import {Space,Button,Table, Modal} from "antd";
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {history} from "@@/core/history";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {queryTemplates,deleteTemplate} from "@/services/templates/templates"

export default () => {
  const {data: templates} = useRequest(() => queryTemplates(), {});

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, t: Templates.Template) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/templates/${t.id}`)}>{name}</a>
        </Space>
      }
    },
    {
      title: 'harbor包名',
      dataIndex: 'chartName',
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (name: string, t: Templates.Template) => {
        return <Space size="middle">
          <Button type='primary' onClick={()=>{history.push(`/admin/templates/${t.id}/edit`)}}>修改</Button>
          <Button type='primary' danger onClick={()=>{
            Modal.confirm({
                title: `确认删除Templates: ${t?.name}`,
                content: `该版本template有可能正在被application或cluster使用，删除前请确认`,
                onOk: () => {
                  deleteTemplate(t?.id).then(() => {
                    Modal.success({
                      title: 'Template',
                      content: '删除Template成功！',
                      afterClose: ()=>{
                        history.go(0)
                      }
                    })
                  })
                }
              }
            )
          }}>删除</Button>
        </Space>
      }
    }
  ]

  const queryInput = (
    <Button
      type="primary"
      style={{marginBottom: 10, float: 'right', marginRight: 5}}
      onClick={() => {
        history.push(`/admin/templates/new`)
      }}
    >
      创建templates
    </Button>
  )

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
      pageSize: 7
    }}
  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
