import React, {useState} from 'react';

import {getClusterStatus} from "@/services/clusters/clusters";
import Detail from '@/components/PageWithBreadcrumb'
import {useParams, useRequest} from "umi";
import {useModel} from "@@/plugin-model/useModel";
import {queryPodContainers} from "@/services/clusters/pods";
import DetailCard, {Param} from "@/components/DetailCard";
import styles from "@/pages/clusters/Pods/PodsTable/index.less";
import Utils from '@/utils'
import {Card, Collapse, Table} from "antd";

const {Panel} = Collapse;
export default (): React.ReactNode => {
  const params = useParams<{ name: string }>();
  const podName = params.name
  const {initialState} = useModel("@@initialState")
  const {id: clusterID} = initialState!.resource
  const [pod, setPod] = useState<CLUSTER.PodFromBackend>()

  useRequest(() => getClusterStatus(clusterID).then(({data}) => {
        if (data.clusterStatus.versions && data.clusterStatus.podTemplateHash) {
          const podInfo = data.clusterStatus.versions[data.clusterStatus.podTemplateHash].pods[podName]
          setPod(podInfo)
        }
      }
    ),
    {
      refreshDeps: [podName]
    }
  )

  const {data: podContainers} = useRequest(() => queryPodContainers(clusterID, {podName: podName}), {
    refreshDeps: [podName]
  })

  return (
    <Detail>
      <DetailCard
        title={<span className={styles.containerDetailHeading}>基本信息</span>}
        data={
          [
            [
              {
                key: "名称",
                value: podName,
              },
              {
                key: "创建时间",
                value: Utils.timeToLocal(pod?.metadata.creationTimestamp || ""),
              },
              {
                key: "状态",
                value: pod?.status.phase
              }
            ],
            [
              {
                key: "命名空间",
                value: pod?.metadata.namespace,
              },
              {
                key: "节点名称",
                value: pod?.spec.nodeName,
              },
              {
                key: "节点IP",
                value: pod?.status.hostIP,
              }
            ]
          ]
        }
      />

      <Card
        title={<span className={styles.containerDetailHeading}>注解</span>}
        type={"inner"}
      >
        <Table
          className={styles.containerDetailTable}
          pagination={
            {
              pageSize: 20,
              hideOnSinglePage: true,
            }
          }
          columns={[
            {
              title: "名称",
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: "值",
              dataIndex: 'value',
              key: 'value',
            },
          ]}
          dataSource={
            Object.keys(pod?.metadata.annotations || {}).map(
              (k) => {
                return {
                  name: k,
                  value: pod?.metadata.annotations[k]
                }
              }
            ).filter(
              (annotation) => {
                return annotation.name.startsWith("cloudnative.music.netease.com/git")
              }
            )
          }
        >
        </Table>
      </Card>

      <Card
        title={<span className={styles.containerDetailHeading}>容器列表</span>}
        style={{marginTop: "20px"}}
        type={"inner"}
      >
        <Collapse>
          {
            podContainers?.map((container) => {
              console.log("container for each: ", container)
              const containerHeader: Param[][] = [[]]
              if (container.status) {
                const stateKey = Object.keys(container?.status?.state)
                if (stateKey.length > 0) {
                  containerHeader[0].push(
                    {
                      key: "状态",
                      value: stateKey[0],
                    }
                  )
                }
                if (container?.status?.state?.waiting) {
                  containerHeader[0].push(
                    {
                      key: "原因",
                      value: container?.status?.state?.waiting?.reason || '',
                    })
                } else if (container?.status?.state?.terminated) {
                  containerHeader[0].push(
                    {
                      key: "原因",
                      value: container?.status?.state?.terminated?.reason || '',
                    },
                    {
                      key: "信息",
                      value: container?.status?.state?.terminated?.message || '',
                    },
                  )
                }
              }
              containerHeader[0].push(
                {key: "是否就绪", value: container?.status?.ready?.toString() || '未就绪'},
                {key: "是否启动", value: container?.status?.started?.toString() || '未就绪'},
              )
              containerHeader.push([{key: "镜像", value: container?.image}])

              return <Panel
                key={container.name}
                header={container.name}
              >
                <DetailCard
                  title={<span className={styles.containerDetailHeading}>基本信息</span>}
                  data={containerHeader}
                />
                <span className={styles.containerDetailHeading}>环境变量</span>
                <Table
                  className={styles.containerDetailTable}
                  pagination={
                    {
                      pageSize: 20,
                      hideOnSinglePage: true,
                    }
                  }
                  columns={[
                    {
                      title: "名称",
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: "值",
                      dataIndex: 'value',
                      key: 'value',
                    },
                  ]}
                  dataSource={container?.env ? container?.env.filter(
                    (env: any) => {
                      return env.value
                    }
                  ) : []}
                  rowKey={(env) => {
                    return env.name
                  }}
                >
                </Table>
                <span className={styles.containerDetailHeading}>存储挂载</span>
                <Table
                  className={styles.containerDetailTable}
                  pagination={
                    {
                      pageSize: 20,
                      hideOnSinglePage: true,
                    }
                  }
                  columns={[
                    {
                      title: "名称",
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: "只读",
                      dataIndex: 'readOnly',
                      key: 'readOnly',
                      render: (value: any) => {
                        return <span>{value.toString()}</span>
                      }
                    },
                    {
                      title: "挂载路径",
                      dataIndex: 'mountPath',
                      key: 'mountPath',
                    },
                    {
                      title: "子路径",
                      dataIndex: 'subPath',
                      key: 'subPath',
                    },
                    {
                      title: "挂载类型",
                      dataIndex: 'volumeType',
                      key: 'volumeType',
                      render: (text: string, volumeMount: CLUSTER.VolumeMount) => {
                        const volumes = Object.keys(volumeMount.volume)
                        if (volumes.length < 2) {
                          return <div/>
                        }
                        return <span>{volumes[1]}</span>
                      }
                    },
                  ]}
                  dataSource={container?.volumeMounts ? container?.volumeMounts : []}
                  rowKey={(volumeMount) => {
                    return volumeMount.name
                  }}
                >
                </Table>
              </Panel>
            })
          }
        </Collapse>
      </Card>
    </Detail>
  );
}
;
