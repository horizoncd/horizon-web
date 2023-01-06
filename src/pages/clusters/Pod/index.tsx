import React, { useState } from 'react';

import { useIntl, useParams, useRequest } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import type {
  V1ContainerStatus, V1Handler, V1Probe,
} from '@kubernetes/client-node';
import {
  Button, Card, Collapse, Table, Tag,
} from 'antd';
import CodeMirror from '@uiw/react-codemirror';
// import { yaml } from '@codemirror/lang-yaml';
import { StreamLanguage } from '@codemirror/language';
import { yaml as YamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { history } from '@@/core/history';
import copy from 'copy-to-clipboard';
import yaml from 'js-yaml';
import podStyles from './index.less';
import styles from '@/pages/clusters/Pods/PodsTable/index.less';
import DetailCard from '@/components/DetailCard';
import type { Param } from '@/components/DetailCard';
import { queryPodDetail } from '@/services/clusters/pods';
import Detail from '@/components/PageWithBreadcrumb';

const { Panel } = Collapse;
export default (props: any): React.ReactNode => {
  const { location } = props;
  const intl = useIntl();
  const params = useParams<{ name: string }>();
  const podName = params.name;
  const { initialState } = useModel('@@initialState');
  const { id: clusterID } = initialState!.resource;

  const { query: q } = location;
  const { yamlMode = false } = q;

  const [containerStatus, setContainerStatus] = useState<Record<string, V1ContainerStatus>>({});
  const { successAlert, errorAlert } = useModel('alert');

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.cluster.pod.${suffix}` });

  const { data: pod } = useRequest(() => queryPodDetail(clusterID, podName), {
    refreshDeps: [podName],
    onSuccess: () => {
      const st = {};
      pod?.status?.containerStatuses?.forEach(
        (s) => {
          st[s.name] = s;
        },
      );
      setContainerStatus(st);
      const ist = {};
      pod?.status?.initContainerStatuses?.forEach(
        (s) => {
          ist[s.name] = s;
        },
      );
    },
  });

  const omitAnnotations = [
    'cloudnative.music.netease.com/http-probe.sh',
    'cloudnative.music.netease.com/offline-once.sh',
    'cloudnative.music.netease.com/offline.sh',
    'cloudnative.music.netease.com/online-once.sh',
    'cloudnative.music.netease.com/online.sh',
    'cloudnative.music.netease.com/startup.sh',
    'cloudnative.music.netease.com/status.sh',
  ];

  const lifecycleTable = (name: string, handler: V1Handler) => {
    let check = '';
    if (handler.exec?.command) {
      check = handler.exec.command.join(' ');
    } else if (handler.httpGet) {
      check = (handler.httpGet.scheme || '') + handler.httpGet.host + handler.httpGet.path;
    }
    return (
      <div>
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
              title: handler?.exec?.command ? 'Exec Command' : 'Http Healthcheck URI',
              dataIndex: 'check',
              key: 'check',
            },
          ]}
          dataSource={[{
            check,
          }]}
        />
      </div>
    );
  };

  const probeTable = (name: string, probe: V1Probe) => {
    let check = '';
    if (probe.exec?.command) {
      check = probe.exec.command.join(' ');
    } else if (probe.httpGet) {
      check = `${probe.httpGet.scheme?.toLocaleLowerCase() || 'http'}://${
        probe.httpGet.host || 'localhost'}:${
        probe.httpGet.port
      }${probe.httpGet.path}`;
    }
    return (
      <div>
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
              title: 'Initial Delay (Seconds)',
              dataIndex: 'delay',
              key: 'delay',
            },
            {
              title: 'Timeout (Seconds)',
              dataIndex: 'timeout',
              key: 'timeout',
            },
            {
              title: 'Probe Period (Seconds)',
              dataIndex: 'period',
              key: 'period',
            },
            {
              title: 'Success Threshold',
              dataIndex: 'success',
              key: 'success',
            },
            {
              title: 'Failure Threshold',
              dataIndex: 'failure',
              key: 'failure',
            },
            {
              title: probe?.exec?.command ? 'Exec Command' : 'Http Healthcheck URI',
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
            check,
          }]}
        />
      </div>
    );
  };

  const onCopyClick = () => {
    if (copy(yaml.dump(pod))) {
      successAlert(intl.formatMessage({ id: 'pages.message.copy.success' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'pages.message.copy.fail' }));
    }
  };

  return (
    <Detail>
      <div style={{ marginBottom: '5px', textAlign: 'right' }}>
        {
          yamlMode && (
          <Button
            style={{ marginRight: '10px' }}
            onClick={onCopyClick}
          >
            {intl.formatMessage({ id: 'pages.common.copy' })}
          </Button>
          )
        }
        {
          yamlMode ? (
            <Button
              type="primary"
              onClick={() => {
                history.replace({
                  query: {
                    yamlMode: false,
                  },
                });
              }}
              style={{ marginRight: '10px' }}
            >
              {formatMessage('normalView')}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                history.replace({
                  query: {
                    yamlMode: true,
                  },
                });
              }}
              style={{ marginRight: '10px' }}
            >
              {formatMessage('yamlView')}
            </Button>
          )
        }
      </div>
      {
        yamlMode ? (
          <CodeMirror
            value={yaml.dump(pod)}
            theme="dark"
            readOnly
            // mode="yaml"
            extensions={[StreamLanguage.define(YamlMode)]}
          />
        ) : (
          <div>
            <DetailCard
              title={(
                <span className={styles.containerDetailHeading}>
                  {intl.formatMessage({ id: 'pages.common.basicInfo' })}
                </span>
              )}
              data={
              [
                [
                  {
                    key: intl.formatMessage({ id: 'pages.common.name' }),
                    value: podName,
                  },
                  {
                    key: 'UID',
                    value: pod?.metadata?.uid,
                  },
                  {
                    key: intl.formatMessage({ id: 'pages.cluster.podsTable.createdAt' }),
                    value: pod?.metadata?.creationTimestamp,
                  },
                  {
                    key: intl.formatMessage({ id: 'pages.cluster.podsTable.podStatus' }),
                    value: pod?.status?.phase || '',
                  },
                  {
                    key: formatMessage('labels'),
                    value: (
                      <div>
                        {
                          Object.keys(pod?.metadata?.labels || {}).map(
                            (k) => (
                              <Tag
                                className={podStyles.annotation}
                                key={k}
                              >
                                {k}
                                :
                                {pod!.metadata!.labels![k]}
                              </Tag>
                            ),
                          )
                        }
                      </div>
                    ),
                  },
                ],
                [
                  {
                    key: formatMessage('namespace'),
                    value: pod?.metadata?.namespace || '',
                  },
                  {
                    key: intl.formatMessage({ id: 'pages.cluster.podsTable.annotations' }),
                    value: (
                      <div>
                        {
                          Object.keys(pod?.metadata?.annotations || {}).filter((k) => omitAnnotations.indexOf(k) < 0).map(
                            (k) => (
                              <Tag
                                className={podStyles.annotation}
                                key={k}
                              >
                                {k}
                                :
                                {pod!.metadata!.annotations![k]}
                              </Tag>
                            ),
                          )
                        }
                      </div>
                    ),
                  },
                ],
              ]
            }
            />

            <DetailCard
              title={(
                <span className={styles.containerDetailHeading}>
                  {formatMessage('resourceInfo')}
                </span>
              )}
              data={
              [
                [
                  {
                    key: formatMessage('nodeName'),
                    value: pod?.spec?.nodeName || '',
                  },
                  {
                    key: formatMessage('nodeIP'),
                    value: pod?.status?.hostIP || '',
                  },
                  {
                    key: formatMessage('nodeSelector'),
                    value: (
                      <div>
                        {
                          Object.keys(pod?.spec?.nodeSelector || {}).map(
                            (k) => (
                              <Tag
                                className={podStyles.annotation}
                                key={k}
                              >
                                {k}
                                :
                                {pod!.spec!.nodeSelector![k]}
                              </Tag>
                            ),
                          )
                        }
                      </div>
                    ),
                  },
                ],
                [
                  {
                    key: 'QoS Class',
                    value: pod?.status?.qosClass,
                  },
                  {
                    key: 'Service Account',
                    value: pod?.spec?.serviceAccount,
                  },
                  {
                    key: 'Security Context',
                    value: pod?.spec?.securityContext,
                  },
                ],
              ]
            }
            />

            <Card
              title={<span className={styles.containerDetailHeading}>{formatMessage('statusDetail')}</span>}
              type="inner"
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
                    title: formatMessage('statusDetail.type'),
                    dataIndex: 'type',
                    key: 'type',
                  },
                  {
                    title: formatMessage('statusDetail.status'),
                    dataIndex: 'status',
                    key: 'status',
                  },
                  {
                    title: formatMessage('statusDetail.lastProbeTime'),
                    dataIndex: 'lastProbeTime',
                    key: 'lastProbeTime',
                  },
                  {
                    title: formatMessage('statusDetail.lastTransitionTime'),
                    dataIndex: 'lastTransitionTime',
                    key: 'lastTransitionTime',
                  },
                  {
                    title: formatMessage('statusDetail.reason'),
                    dataIndex: 'reason',
                    key: 'reason',
                  },
                  {
                    title: formatMessage('statusDetail.message'),
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
              title={(
                <span className={styles.containerDetailHeading}>
                  {intl.formatMessage({ id: 'pages.cluster.container.list' })}
                </span>
              )}
              style={{ marginTop: '20px' }}
              type="inner"
            >
              <Collapse>
                {
                pod?.spec?.containers?.map((container) => {
                  const containerHeader: Param[][] = [[]];
                  const cs = containerStatus![container.name];
                  if (cs) {
                    const stateKey = Object.keys(cs.state!);
                    if (stateKey.length > 0) {
                      containerHeader[0].push(
                        {
                          key: intl.formatMessage({ id: 'pages.cluster.container.status' }),
                          value: stateKey[0],
                        },
                      );
                    }
                    if (cs.state?.waiting) {
                      containerHeader[0].push(
                        {
                          key: intl.formatMessage({ id: 'pages.cluster.container.reason' }),
                          value: cs.state.waiting.reason || '',
                        },
                      );
                    } else if (cs.state?.terminated) {
                      containerHeader[0].push(
                        {
                          key: intl.formatMessage({ id: 'pages.cluster.container.reason' }),
                          value: cs.state.terminated.reason || '',
                        },
                        {
                          key: intl.formatMessage({ id: 'pages.cluster.container.message' }),
                          value: cs.state.terminated.message || '',
                        },
                      );
                    }
                  }
                  containerHeader[0].push(
                    {
                      key: intl.formatMessage({ id: 'pages.cluster.container.ready' }),
                      value: containerStatus![container.name]?.ready?.toString() || 'false',
                    },
                    {
                      key: intl.formatMessage({ id: 'pages.cluster.container.started' }),
                      value: containerStatus![container.name]?.started?.toString() || 'false',
                    },
                  );
                  containerHeader.push([
                    { key: intl.formatMessage({ id: 'pages.common.image' }), value: container?.image },
                  ]);

                  if (container.ports) {
                    const ports: Param[] = container.ports.map(
                      (port) => ({
                        key: port.name,
                        value: {
                          port: port.containerPort,
                          protocal: port.protocol,
                        },
                      }),
                    );
                    containerHeader[1].push(...ports);
                  }

                  return (
                    <Panel
                      key={container.name}
                      header={container.name}
                    >
                      <DetailCard
                        title={<span className={styles.containerDetailHeading}>{intl.formatMessage({ id: 'pages.common.basicInfo' })}</span>}
                        data={containerHeader}
                      />
                      <span className={styles.containerDetailHeading}>{intl.formatMessage({ id: 'pages.cluster.container.variables' })}</span>
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
                            title: intl.formatMessage({ id: 'pages.common.name' }),
                            dataIndex: 'name',
                            key: 'name',
                          },
                          {
                            title: intl.formatMessage({ id: 'pages.common.value' }),
                            dataIndex: 'value',
                            key: 'value',
                          },
                        ]}
                        dataSource={container?.env ? container?.env.filter(
                          (env: any) => env.value,
                        ) : []}
                        rowKey={(env) => env.name}
                      />
                      <span className={styles.containerDetailHeading}>
                        {intl.formatMessage({ id: 'pages.cluster.container.volumeMount' })}
                      </span>
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
                            title: intl.formatMessage({ id: 'pages.common.name' }),
                            dataIndex: 'name',
                            key: 'name',
                          },
                          {
                            title: intl.formatMessage({ id: 'pages.cluster.container.readonly' }),
                            dataIndex: 'readOnly',
                            key: 'readOnly',
                            render: (value: any) => <span>{value?.toString() || 'false'}</span>,
                          },
                          {
                            title: intl.formatMessage({ id: 'pages.cluster.container.mountPath' }),
                            dataIndex: 'mountPath',
                            key: 'mountPath',
                          },
                          {
                            title: intl.formatMessage({ id: 'pages.cluster.container.subpath' }),
                            dataIndex: 'subPath',
                            key: 'subPath',
                          },
                        ]}
                        dataSource={container?.volumeMounts ? container?.volumeMounts : []}
                        rowKey={(volumeMount) => volumeMount.name}
                      />
                      {
                      container.lifecycle?.postStart && lifecycleTable('Post Start', container!.lifecycle.postStart)
                    }
                      {
                      container.lifecycle?.preStop && lifecycleTable('Pre Stop', container!.lifecycle.preStop)
                    }
                      {
                      container.livenessProbe && probeTable('Liveness Probe', container!.livenessProbe)
                    }
                      {
                      container.readinessProbe && probeTable('Readiness Probe', container!.readinessProbe)
                    }
                      {
                      container.startupProbe && probeTable('Startup Probe', container!.startupProbe)
                    }
                    </Panel>
                  );
                })
              }
              </Collapse>
            </Card>
          </div>
        )
      }
    </Detail>
  );
};
