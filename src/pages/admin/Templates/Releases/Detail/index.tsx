import DetailCard, {Param} from "@/components/DetailCard";
import {useParams} from "umi";
import NotFount from "@/pages/404";
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


export default () => {
  const params = useParams<{ id: string, template: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const templateID = parseInt(params.template)
  const releaseID = parseInt(params.id)
  const {data: release} = useRequest(() => getRelease(releaseID))

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: release?.name,
      },
      {
        key: '描述',
        value: release?.description,
      },
      {
        key: '推荐',
        value: release?.recommended ? <FireFilled style={{color:'	#FF4500'}}/> : '非推荐版本'
      }
    ],
  ]

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
      extra={
        <Space>
          <Button type='primary' onClick={() => {
            syncReleaseToRepo(release?.id).then(()=>{
                    Modal.success({
                      title: 'Release',
                      content: '同步Release成功！',
                    })
            })
          }}>同步</Button>
          <Button type='primary' onClick={() => {
            history.push(`/admin/templates/${templateID}/releases/${release?.id}/edit`)
          }}>
            编辑
          </Button>
          <Button danger onClick={() => {
            Modal.confirm({
                title: `确认删除Release: ${release?.name}`,
                content: `该版本template有可能正在被application或cluster使用，删除前请确认`,
                onOk: () => {
                  deleteRelease(releaseID).then(() => {
                    alert("delete")
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
