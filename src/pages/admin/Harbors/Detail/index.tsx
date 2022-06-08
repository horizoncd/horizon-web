import DetailCard, {Param} from "@/components/DetailCard";
import {useParams} from "umi";
import NotFount from "@/pages/404";
import {useRequest} from "@@/plugin-request/request";
import {deleteHarborByID, getHarborByID} from "@/services/harbors/harbors";
import Utils from "@/utils";
import {history} from "@@/core/history";
import {Button, Modal, Space} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";

export default () => {
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const {successAlert} = useModel('alert')
  const harborID = parseInt(params.id)
  const {data: harbor} = useRequest(() => getHarborByID(harborID), {});

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: harbor?.name,
      },
      {
        key: 'server',
        value: harbor?.server,
      },
      {
        key: 'token',
        value: harbor?.token,
      },
      {
        key: '镜像预热ID',
        value: harbor?.preheatPolicyID,
      },
    ],
    [
      {
        key: '创建时间',
        value: Utils.timeToLocal(harbor?.createdAt || ""),
      },
      {
        key: '修改时间',
        value: Utils.timeToLocal(harbor?.updatedAt || ""),
      },
    ]
  ]

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
      extra={
        <Space>
          <Button type='primary' onClick={() => {
            history.push(`/admin/harbors/${harborID}/edit`)
          }}>
            编辑
          </Button>
          <Button danger onClick={() => {
            Modal.confirm({
                title: `确认删除Harbor: ${harbor?.name}`,
                onOk: () => {
                  deleteHarborByID(harborID).then(() => {
                    successAlert('Harbor 删除成功')
                    history.push(`/admin/harbors`)
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
