import DetailCard, {Param} from "@/components/DetailCard";
import {useParams} from "umi";
import NotFount from "@/pages/404";
import {useRequest} from "@@/plugin-request/request";
import {history} from "@@/core/history";
import {Button, Card, Modal, Space} from "antd";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {deleteTemplate, queryTemplate} from '@/services/templates/templates'
import {ReleasesTable} from "../Releases";


export default () => {
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const templateID = parseInt(params.id)
  const {data: template} = useRequest(() => queryTemplate(templateID), {});

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: template?.name,
      },
      {
        key: 'Harbor包名',
        value: template?.chartName,
      },
      {
        key: '描述',
        value: template?.description,
      },
    ],
  ]

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
      extra={
        <Space>
          <Button type='primary' onClick={() => {
            history.push(`/admin/templates/${templateID}/members`)
          }}>
            member管理
          </Button>
          <Button type='primary' onClick={() => {
            history.push(`/admin/templates/${templateID}/edit`)
          }}>
            编辑
          </Button>
          <Button danger onClick={() => {
            Modal.confirm({
                title: `确认删除Templates: ${template?.name}`,
                content: `该版本template有可能正在被application或cluster使用，删除前请确认`,
                onOk: () => {
                  deleteTemplate(templateID).then(() => {
                    Modal.success({
                      title: 'Template',
                      content: '删除Template成功！',
                      afterClose: ()=>{
                        history.push(`/admin/templates`)
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
    <Card title="Releases">
      <ReleasesTable/>
    </Card>
  </PageWithBreadcrumb>
}
