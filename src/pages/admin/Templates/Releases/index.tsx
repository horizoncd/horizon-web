import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {Space,Button,Table, Modal} from "antd";
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {history} from "@@/core/history";
import {deleteRelease, queryReleases, syncReleaseToRepo} from "@/services/templates/templates"
import {useParams} from "umi";
import {FireFilled} from "@ant-design/icons";


export const ReleasesTable = () => {
  const params = useParams<{id: string}>()
  const templateID = parseInt(params.id)
  const {data: releases} = useRequest(() => queryReleases(templateID))


  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, t: Templates.Release) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/templates/${templateID}/releases/${t.id}`)}>{name}</a>
        </Space>
      }
    },
    {
      title: '描述',
      dataIndex: 'description'
    },
    {
      title: '推荐',
      render: (recommended: boolean) => {
        return recommended? <><FireFilled style={{color:'	#FF4500'}}/></>:<></>
      },
      dataIndex: 'recommended'
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (name: string, r: Templates.Release) => {
        return <Space size="middle">
          <Button type='primary' onClick={() => {
            syncReleaseToRepo(r.id).then(()=>{
                    Modal.success({
                      title: 'Release',
                      content: '同步Release成功！',
                    })
            })
          }}>同步</Button>

          <Button type='primary' onClick={()=>{history.push(`/admin/templates/${templateID}/releases/${r.id}/edit`)}}>修改</Button>
          <Button type='primary' danger onClick={()=>{
            Modal.confirm({
                title: `确认删除Release: ${r.name}`,
                content: `该release有可能正在被application或cluster使用，删除前请确认`,
                onOk: () => {
                  deleteRelease(r.id).then(() => {
                    Modal.success({
                      title: 'Release',
                      content: '删除Release成功！',
                      afterClose: ()=>{
                        history.go(0)
                      }
                    })
                  })
                }
              }
            )
          }
          }>删除</Button>
        </Space>
      }
    }
  ]

  const queryInput = (
    <Button
      type="primary"
      style={{marginBottom: 10, float: 'right', marginRight: 5}}
      onClick={() => {
        history.push(`/admin/templates/${templateID}/releases/new`)
      }}
    >
      创建release
    </Button>
  )

  const locale = {
    emptyText: <NoData title={'releases'} desc={
      'release是发布template的具体版本，和gitlab tag相关联'}
    />
  }

  const table = <Table
    rowKey={'id'}
    columns={columns}
    dataSource={releases}
    locale={locale}
    pagination={{
      position: ['bottomCenter'],
      hideOnSinglePage: true,
      total: releases?.length,
      pageSize: 7
    }}
  />

  return <>
      {queryInput}
      {table}
    </>
}


export default () => {
  return <PageWithBreadcrumb>
    <ReleasesTable/>
  </PageWithBreadcrumb>
}
