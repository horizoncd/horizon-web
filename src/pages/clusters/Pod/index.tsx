import React, {useState} from 'react';

import {getClusterStatus} from "@/services/clusters/clusters";
import Detail from '@/components/PageWithBreadcrumb'
import {useParams, useRequest} from "umi";
import {useModel} from "@@/plugin-model/useModel";
import {queryPodContainers, queryPodDetail} from "@/services/clusters/pods";
import type {Param} from "@/components/DetailCard";
import DetailCard from "@/components/DetailCard";
import styles from "@/pages/clusters/Pods/PodsTable/index.less";
import podStyles from "./index.less";
import Utils from '@/utils'
import type {V1Handler, V1Probe} from '@kubernetes/client-node';
import {V1VolumeMount} from '@kubernetes/client-node'
import {Button, Card, Collapse, Table, Tag} from "antd";
import CodeMirror from '@uiw/react-codemirror';
import {StreamLanguage} from '@codemirror/language';
import {json} from '@codemirror/lang-json';
import {history} from "@@/core/history";
import PodsTable from '../Pods/PodsTable';

const {Panel} = Collapse;
export default (props: any): React.ReactNode => {
  const params = useParams<{ name: string }>();
  const podName = params.name
  const {initialState} = useModel("@@initialState")
  const {id: clusterID} = initialState!.resource

  const {query: q} = props.location;
  const {jsonMode = false} = q

  const {data: pod} = useRequest(() => queryPodDetail(clusterID, podName), {
    refreshDeps: [podName]
  })

  const lifecycleTable = (name: string, handler: V1Handler) => {
    return <div>
      <span className={styles.containerDetailHeading}>{name}</span>
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
            title: handler?.exec?.command ? "Exec Command": "Http Healthcheck URI",
            dataIndex: 'check',
            key: 'check',
          },
        ]}
        dataSource={handler.exec? [{
          check: handler.exec?.command ? handler.exec.command.join(" ") :
            handler.httpGet?.path || "",
        }] : []}
      />
    </div>
  }

  const probeTable = (name: string, probe: V1Probe) => {
    return <div>
      <span className={styles.containerDetailHeading}>{name}</span>
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
            title: "Initial Delay (Seconds)",
            dataIndex: 'delay',
            key: 'delay',
          },
          {
            title: "Timeout (Seconds)",
            dataIndex: 'timeout',
            key: 'timeout',
          },
          {
            title: "Probe Period (Seconds)",
            dataIndex: 'period',
            key: 'period',
          },
          {
            title: "Success Threshold (Seconds)",
            dataIndex: 'success',
            key: 'success',
          },
          {
            title: "Failure Threshold (Seconds)",
            dataIndex: 'failure',
            key: 'failure',
          },
          {
            title: probe?.exec?.command ? "Exec Command": "Http Healthcheck URI",
            dataIndex: 'check',
            key: 'check',
          },
        ]}
        dataSource={probe? [{
          delay: probe.initialDelaySeconds || 0,
          timeout: probe.timeoutSeconds,
          period: probe.periodSeconds,
          success: probe.successThreshold,
          failure: probe.failureThreshold,
          check: probe.exec?.command ? probe.exec.command.join(" ") :
            probe.httpGet?.path || "",
        }] : []}
      />
    </div>
  }

  return (
    <Detail>
      <div style={{marginBottom: '5px', textAlign: 'right'}}>
        {
          jsonMode ? <Button
            type="primary" onClick={() => {
              history.replace({
                // pathname: `${fullPath}`,
                query: {
                  jsonMode: false,
                }
              })
            }}
            style={{marginRight: '10px'}}>
            普通视图
          </Button>:<Button
            type="primary" onClick={() => {
              history.replace({
                // pathname: `${fullPath}`,
                query: {
                  jsonMode: true,
                }
              })
            }}
            style={{marginRight: '10px'}}>
            JSON视图
          </Button>
        }
      </div>
      {
        jsonMode ? <CodeMirror
          value={JSON.stringify(pod, null, 2)} 
          theme={"dark"}
          extensions={[json()]}
        />: <div>
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
                    key: "UID",
                    value: pod?.metadata?.uid,
                  },
                  {
                    key: "创建时间",
                    value: pod?.metadata?.creationTimestamp,
                  },
                  {
                    key: "状态",
                    value: pod?.status?.phase || ""
                  },
                  {
                    key: "标签",
                    value: <div>
                      {
                        Object.keys(pod?.metadata?.labels || {}).map(
                          (k) => {
                            return <Tag
                              className={podStyles.annotation}
                              key={k}
                            >
                              {k}:{pod!.metadata!.labels![k]}
                            </Tag>
                          }
                        )
                      }
                    </div>
                  }
                ],
                [
                  {
                    key: "命名空间",
                    value: pod?.metadata?.namespace || "",
                  },
                  {
                    key: "注解",
                    value: <div>
                      {
                        Object.keys(pod?.metadata?.annotations|| {}).filter((k) => {
                          return !(k.startsWith("cloudnative.music.netease.com/http") ||
                           k.startsWith("cloudnative.music.netease.com/status") ||
                           k.startsWith("cloudnative.music.netease.com/startup") ||
                           k.startsWith("cloudnative.music.netease.com/offline") ||
                           k.startsWith("cloudnative.music.netease.com/online")
                          )
                        }).map(
                          (k) => {
                            return <Tag
                              className={podStyles.annotation}
                              key={k}
                            >
                              {k}:{pod!.metadata!.annotations![k]}
                            </Tag>
                          }
                        )
                      }
                    </div>
                  }
                ]
              ]
            }
          />

          <DetailCard
            title={<span className={styles.containerDetailHeading}>资源信息</span>}
            data={
              [
                [
                  {
                    key: "所在节点名称",
                    value: pod?.spec?.nodeName || "",
                  },
                  {
                    key: "所在节点IP",
                    value: pod?.status?.hostIP || "",
                  },
                  {
                    key: "节点标签选择器",
                    value: <div>
                      {
                        Object.keys(pod?.spec?.nodeSelector|| {}).map(
                          (k) => {
                            return <Tag
                              className={podStyles.annotation}
                              key={k}
                            >
                              {k}:{pod!.spec!.nodeSelector![k]}
                            </Tag>
                          }
                        )
                      }
                    </div>
                  }
                ],
                [
                  {
                    key: "QoS Class",
                    value: pod?.status?.qosClass,
                  },
                  {
                    key: "Service Account",
                    value: pod?.spec?.serviceAccount,
                  },
                  {
                    key: "Security Context",
                    value: pod?.spec?.securityContext
                  }
                ]
              ]
            }
          />

          <Card
            title={<span className={styles.containerDetailHeading}>状态详情</span>}
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
                  title: "类别",
                  dataIndex: 'type',
                  key: 'type',
                },
                {
                  title: "状态",
                  dataIndex: 'status',
                  key: 'status',
                },
                {
                  title: "最后检测时间",
                  dataIndex: 'lastProbeTime',
                  key: 'lastProbeTime',
                },
                {
                  title: "最后迁移时间",
                  dataIndex: 'lastTransitionTime',
                  key: 'lastTransitionTime',
                },
                {
                  title: "原因",
                  dataIndex: 'reason',
                  key: 'reason',
                },
                {
                  title: "信息",
                  dataIndex: 'message',
                  key: 'message',
                },
              ]}
              dataSource={
                pod?.status?.conditions
              }
            />
          </Card>

          <Card
            title={<span className={styles.containerDetailHeading}>容器列表</span>}
            style={{marginTop: "20px"}}
            type={"inner"}
          >
            <Collapse>
              {
                pod?.spec?.containers?.map((container) => {
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
                    />
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
                            return <span>{value?.toString() || "false"}</span>
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
                      ]}
                      dataSource={container?.volumeMounts ? container?.volumeMounts : []}
                      rowKey={(volumeMount) => {
                        return volumeMount.name
                      }}
                    />
                    {
                      container.lifecycle?.postStart && lifecycleTable("Post Start", container!.lifecycle.postStart)
                    }
                    {
                      container.lifecycle?.preStop && lifecycleTable("Pre Stop", container!.lifecycle.preStop)
                    }
                    {
                      container.livenessProbe && probeTable("Liveness Probe", container!.livenessProbe)
                    }
                    {
                      container.readinessProbe && probeTable("Readiness Probe", container!.readinessProbe)
                    }
                    {
                      container.startupProbe && probeTable("Startup Probe", container!.startupProbe)
                    }
                  </Panel>
                })
              }
            </Collapse>
          </Card>
        </div>
      }
    </Detail>
  );
}
;
