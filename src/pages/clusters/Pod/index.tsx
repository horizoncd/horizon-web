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
import type {V1ContainerState, V1ContainerStatus, V1Handler, V1Probe} from '@kubernetes/client-node';
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

  const [containerStatus, setContainerStatus] = useState<Record<string, V1ContainerStatus>>({})
  const [initContainerStatus, setInitContainerStatus] = useState<Record<string, V1ContainerStatus>>({})


  const {data: pod} = useRequest(() => queryPodDetail(clusterID, podName), {
    refreshDeps: [podName],
    onSuccess: ()=>{
      const st = {}
      pod?.status?.containerStatuses?.forEach(
        (s)=>{
          st[s.name] = s
        }
      )
      console.log(st)
      setContainerStatus(st)
      const ist = {}
      pod?.status?.initContainerStatuses?.forEach(
        (s)=>{
          ist[s.name] = s
        }
      )
      setInitContainerStatus(ist)
    }
  })

  const omitAnnotations = [
    'cloudnative.music.netease.com/http-probe.sh',
    'cloudnative.music.netease.com/offline-once.sh',
    'cloudnative.music.netease.com/offline.sh',
    'cloudnative.music.netease.com/online-once.sh',
    'cloudnative.music.netease.com/online.sh',
    'cloudnative.music.netease.com/startup.sh',
    'cloudnative.music.netease.com/status.sh',
  ]

  const lifecycleTable = (name: string, handler: V1Handler) => {
    let check = ""
    if (handler.exec?.command) {
      check = handler.exec.command.join(" ")
    } else if (handler.httpGet) {
      check = (handler.httpGet.scheme || '' ) + handler.httpGet.host + handler.httpGet.path
    }
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
        dataSource={[{
          check: check,
        }]}
      />
    </div>
  }

  const probeTable = (name: string, probe: V1Probe) => {
    let check = ""
    if (probe.exec?.command) {
      check = probe.exec.command.join(" ")
    } else if (probe.httpGet) {
      check = (probe.httpGet.scheme?.toLocaleLowerCase() || 'http' ) + '://' + 
      (probe.httpGet.host || 'localhost') + ':' +
      (probe.httpGet.port) + 
      probe.httpGet.path
    }
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
            title: "Success Threshold",
            dataIndex: 'success',
            key: 'success',
          },
          {
            title: "Failure Threshold",
            dataIndex: 'failure',
            key: 'failure',
          },
          {
            title: probe?.exec?.command ? "Exec Command": "Http Healthcheck URI",
            dataIndex: 'check',
            key: 'check',
          },
        ]}
        dataSource={[{
          delay: probe.initialDelaySeconds || 0,
          timeout: probe.timeoutSeconds,
          period: probe.periodSeconds,
          success: probe.successThreshold,
          failure: probe.failureThreshold,
          check: check
        }]}
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
                          return omitAnnotations.indexOf(k) < 0
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
                  title: "最后转变时间",
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
                  const containerHeader: Param[][] = [[]];
                  const cs = containerStatus![container.name]
                  if (cs) {
                    const stateKey = Object.keys(cs.state)
                    if (stateKey.length > 0) {
                      containerHeader[0].push(
                        {
                          key: "状态",
                          value: stateKey[0],
                        }
                      )
                    }
                    if (cs.state?.waiting) {
                      containerHeader[0].push(
                        {
                          key: "原因",
                          value: cs.state.waiting.reason || '',
                        })
                    } else if (cs.state?.terminated) {
                      containerHeader[0].push(
                        {
                          key: "原因",
                          value: cs.state.terminated.reason || '',
                        },
                        {
                          key: "信息",
                          value: cs.state.terminated.message || '',
                        },
                      )
                    }
                  }
                  containerHeader[0].push(
                    {key: "是否就绪", value: containerStatus![container.name]?.ready?.toString() || '未就绪'},
                    {key: "是否启动", value: containerStatus![container.name]?.started?.toString() || '未启动'},
                  )
                  containerHeader.push([
                    {key: "镜像", value: container?.image},
                  ])
                  
                  if (container.ports) {
                    const ports: Param[] = container.ports.map(
                      (port)=>{
                        return {
                          key: port.name,
                          value: {
                            "port": port.containerPort,
                            "protocal": port.protocol,
                          }
                        }
                      }
                    )
                    containerHeader[1].push(...ports)
                  }


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
                    <span className={styles.containerDetailHeading}>Volume Mount</span>
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
