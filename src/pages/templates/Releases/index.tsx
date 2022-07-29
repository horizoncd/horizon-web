import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {Space,Button,Table, Modal} from "antd";
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {history} from "@@/core/history";
import {deleteRelease, queryReleases, syncReleaseToRepo} from "@/services/templates/templates"
import {FireFilled} from "@ant-design/icons";
import {NotFount} from '@/components/State';
import {useModel} from 'umi';
import type {API} from '@/services/typings';
import RBAC from '@/rbac'
import {hasPermission} from "../utils";

export const ReleasesTable = (props: {fullName: string, releases: Templates.Release[], currentUser: API.CurrentUser}) => {
  const {releases,fullName} = props

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, t: Templates.Release) => {
        return <Space size="middle">
          <a href={`/releases/${fullName}/${t.name}/-/detail`}>{name}</a>
        </Space>
      }
    },
    {
      title: '推荐',
      render: (recommended: boolean) => {
        return recommended? <><FireFilled style={{color:'	#FF4500'}}/></>:<></>
      },
      dataIndex: 'recommended'
    },
    {
      title: 'Commit ID',
      dataIndex: 'commitID'
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatus'
    },
    {
      title: '最后同步时间',
      dataIndex: 'lastSyncAt',
      render: (syncTime: string) => {
        return new Date(syncTime).toLocaleString()
      }
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (name: string, r: Templates.Release) => {
        return <Space size="middle">
          <Button type='primary' 
          disabled={r.syncStatus === "Succeed" || 
          !hasPermission(props.currentUser,RBAC.Permissions.syncRelease.allowed)} 
          onClick={() => {
            syncReleaseToRepo(r.id).then(()=>{
                    Modal.success({
                      title: 'Release',
                      content: '同步Release成功！',
                    })
            })
          }}>同步</Button>

          <Button type='primary' disabled={!hasPermission(props.currentUser,RBAC.Permissions.updateRelease.allowed)}
           href={`/releases/${fullName}/${r.name}/-/edit`}>修改</Button>
          <Button type='primary' disabled={!hasPermission(props.currentUser,RBAC.Permissions.deleteRelease.allowed)}
          danger onClick={()=>{
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

  let queryInput = (
    <Button
      type="primary"
      style={{marginBottom: 10, float: 'right', marginRight: 5}}
      onClick={() => {
        history.push(`/templates/${fullName}/-/newrelease`)
      }}
    >
      创建release
    </Button>
  )

  if(!hasPermission(props.currentUser,RBAC.Permissions.createRelease.allowed)) {
    queryInput = <></>
  }

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
  const {initialState} = useModel("@@initialState")

  if (!initialState) {
    return <NotFount />;
  }

  const {fullName,id} = initialState.resource
  const {data: releases} = useRequest(() => queryReleases(id))

  if (!releases || !initialState.currentUser) {
    return <NotFount />;
  }

  return <PageWithBreadcrumb>
    <ReleasesTable fullName={fullName} releases={releases} currentUser={initialState.currentUser}/>
  </PageWithBreadcrumb>
}
