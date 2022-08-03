import DetailCard, {Param} from "@/components/DetailCard";
import {useModel} from "umi";
import {useRequest} from "@@/plugin-request/request";
import {history} from "@@/core/history";
import {Button, Modal, Space} from "antd";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {
    deleteRelease,
    getRelease,
    syncReleaseToRepo,
} from '@/services/templates/templates'
import {FireFilled} from "@ant-design/icons";
import rbac from "@/rbac";

export default () => {
  const {initialState} = useModel("@@initialState")

  const releaseID = initialState.resource.id
  const {fullName} = initialState.resource
  const {data: release} = useRequest(() => getRelease(releaseID))

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: release?.name,
      },
      {
        key: '推荐',
        value: release?.recommended ? <FireFilled style={{color:'	#FF4500'}}/> : '非推荐版本'
      },
      {
        key: '描述',
        value: release?.description,
      },
    ],
    [
      {
        key: 'Commit ID',
        value: release?.commitID
      },
      {
        key: '同步状态',
        value: release?.syncStatus
      },
      {
        key: '最后同步时间',
        value: new Date(release?.lastSyncAt ?? '').toLocaleString()
      }
    ],
    [
      {
        key: '创建日期',
        value: new Date(release?.createAt ?? '').toLocaleString(),
      },
      {
        key: '更新日期',
        value: new Date(release?.updateAt ?? '').toLocaleString(),
      },
    ]
  ]

  if(!release || release.syncStatus === "Failed") {
    data[1].push({
      key: '失败原因',
      value: release?.failedReason,
    })
  }

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
      extra={
        <Space>
          <Button type='primary' disabled={!release || release.syncStatus === 'Succeed' ||
           rbac.Permissions.syncRelease.allowed}
           onClick={() => {
            syncReleaseToRepo(release?.id).then(()=>{
                    Modal.success({
                      title: 'Release',
                      content: '同步Release成功！',
                      onOk: () => {
                        history.go(0)
                      }
                    })
            })
          }}>同步</Button>
          <Button type='primary' disabled={!rbac.Permissions.updateRelease.allowed}
           onClick={() => {
            history.push(`/releases/${fullName}/-/edit`)
          }}>
            编辑
          </Button>
          <Button danger disabled={!rbac.Permissions.deleteRelease.allowed} 
          onClick={() => {
            Modal.confirm({
                title: `确认删除Release: ${release?.name}`,
                content: `该版本template有可能正在被application或cluster使用，删除前请确认`,
                onOk: () => {
                  deleteRelease(releaseID).then(() => {
                  Modal.success({
                    title: 'Release',
                    content: '删除Release成功！',
                    afterClose: () => {
                      history.push(`/releases/${fullName}/-/detail`)
                    }
                  })
                })
                }
              }
            )
          }}
          >
            删除
          </Button>
        </Space>
      }
    />
  </PageWithBreadcrumb>
}
