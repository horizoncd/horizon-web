import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { Popover, Tabs } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  getClusterV2, getClusterStatusV2, getClusterResourceTree, getStepV2, getClusterBuildStatusV2,
} from '@/services/clusters/clusters';
import { ClusterStatus, TaskStatus, PipelineStatus } from '@/const';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import { PageWithInitialState } from '@/components/Enhancement';
import { CenterSpin, MaxSpace } from '@/components/Widget';
import { refreshPodsInfo } from '@/components/rollout';
import PodsTable from '../components/PodsTable';
import { StepCard, BuildCard, CountCircle } from '../components';
import ButtonBarV2 from '../components/ButtonBarV2';
import NoData from '@/components/NoData';
import InfoMenu from '../components/InfoMenu';
import useRefCallback from '../components/useRefCallback';
import { queryTemplate } from '@/services/templates/templates';
import { CatalogType } from '@/services/core';

const { TabPane } = Tabs;

const pollingInterval = 6000;

interface PodsPageProps {
  initialState: API.InitialState,
}

const getLastPattern = (name: string) => {
  const matches = /(?:[_\-a-zA-Z0-9]*\/)*([_\-a-zA-Z0-9]*)/.exec(name);
  if (matches === null || matches.length < 1) {
    return '/';
  }
  return matches[1];
};

function PodsPage(props: PodsPageProps) {
  const intl = useIntl();
  const { initialState: { resource: { id, parentID: applicationID } } } = props;
  const { successAlert } = useModel('alert');
  const [shouldAlertFreed, setShouldAlertFreed] = useState(true);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>();
  const [pipelineStatus, setBuilding] = useState<PipelineStatus>(PipelineStatus.None);
  const [progressing, setProgressing] = useState(false);

  const { data: cluster } = useRequest(() => getClusterV2(id), {});
  const infoMenuRef = useRef();

  useRequest(queryEnvironments, {
    onSuccess: (items) => {
      const e = new Map<string, string>();
      items.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });

  useRequest(() => queryRegions(applicationID, cluster!.scope.environment), {
    onSuccess: (items) => {
      const e = new Map<string, string>();
      items.forEach((item) => e.set(item.name, item.displayName));
      setRegion2DisplayName(e);
    },
    refreshDeps: [cluster],
    ready: !!cluster,
  });

  const { data: clusterBuildStatus, refresh: refreshBuildStatus } = useRequest(() => getClusterBuildStatusV2(id), {
    pollingInterval,
    onSuccess: (status) => {
      const taskStatus = status.runningTask.taskStatus as TaskStatus;
      if (taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING) {
        setBuilding(PipelineStatus.Running);
      } else if (taskStatus === TaskStatus.FAILED) {
        setBuilding(PipelineStatus.Failed);
      } else {
        setBuilding(PipelineStatus.None);
      }
    },
  });

  const { data: template } = useRequest(() => queryTemplate(cluster?.templateInfo?.name), {
    ready: !!cluster,
  });

  const isWorkload = useMemo(() => template && template.type === CatalogType.Workload, [template]);

  const { data: step, run: getStep, refresh: refreshStep } = useRequest(() => getStepV2(id), {
    manual: true,
  });

  const { data: resourceTree, run: getResourceTree } = useRequest(() => getClusterResourceTree(id), {
    manual: true,
  });

  const { data: clusterStatus, refresh: refreshCluster } = useRequest(() => getClusterStatusV2(id), {
    pollingInterval,
    onSuccess: (status) => {
      if (status.status === ClusterStatus.PROGRESSING
        || status.status === ClusterStatus.MANUALPAUSED
        || status.status === ClusterStatus.SUSPENDED
        || status.status === ClusterStatus.NOTHEALTHY
        || status.status === ClusterStatus.DEGRADED) {
        if (infoMenuRef.current) {
          infoMenuRef.current.refreshOutput();
        }
        setProgressing(true);
        getStep();
      } else {
        setProgressing(false);
      }

      if (status.status !== ClusterStatus.FREED
        && status.status !== ClusterStatus.DELETING
        && status.status !== ClusterStatus.NOTFOUND) {
        getResourceTree();
      }

      if (status?.status === ClusterStatus.FREED) {
        if (shouldAlertFreed) {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.hint' }));
          setShouldAlertFreed(false);
        }
      }
    },
  });

  const podsInfo = useMemo(() => refreshPodsInfo(resourceTree), [resourceTree]);

  const showBuildView = useMemo(() => clusterBuildStatus && clusterBuildStatus.latestPipelinerun
    && (pipelineStatus !== PipelineStatus.None), [clusterBuildStatus, pipelineStatus]);

  const showDeployView = useMemo(
    () => pipelineStatus === PipelineStatus.None && progressing && step && step.index !== step.total,
    [pipelineStatus, progressing, step],
  );

  const [deployRef, deployRefCallback] = useRefCallback();
  useEffect(() => {
    if (showDeployView && deployRef) {
      deployRef.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deployRef, showDeployView]);

  if (!clusterStatus || !cluster || !env2DisplayName || !region2DisplayName) {
    return <CenterSpin />;
  }

  return (
    <PageWithBreadcrumb>
      <div>
        <ButtonBarV2 cluster={cluster} template={template} clusterStatus={clusterStatus} manualPaused={step?.manualPaused ?? false} />
        <MaxSpace direction="vertical" size="large">
          <InfoMenu
            showOutputTags={!isWorkload}
            ref={infoMenuRef}
            manualPaused={(step && step.manualPaused) ?? false}
            cluster={cluster}
            clusterStatus={clusterStatus}
            env2DisplayName={env2DisplayName}
            region2DisplayName={region2DisplayName}
            podsInfo={podsInfo}
          />
          {
            showBuildView && (
              <BuildCard
                pipelinerunID={clusterBuildStatus!.latestPipelinerun!.id}
                runningTask={clusterBuildStatus!.runningTask}
              />
            )
          }
          {
            showDeployView && (
              <StepCard
                ref={deployRefCallback}
                step={step}
                refresh={() => { refreshStep(); refreshCluster(); refreshBuildStatus(); }}
                clusterStatus={clusterStatus}
              />
            )
          }
          {
            podsInfo.sortedKey.length >= 1
              && clusterStatus.status !== ClusterStatus.FREED
              && clusterStatus.status !== ClusterStatus.NOTFOUND
              ? (
                <Tabs
                  defaultActiveKey={podsInfo.sortedKey[0]}
                >
                  {
                    podsInfo.sortedKey.map((key, index) => (
                      <TabPane
                        tab={(
                          <Popover content={key}>
                            {
                              `${getLastPattern(key)}`
                            }
                            <CountCircle count={podsInfo.podsMap[key].length} />
                            {podsInfo.sorted && index === 0 ? ' (current)' : ''}
                          </Popover>
                        )}
                        key={key}
                        tabKey={key}
                      >
                        <PodsTable key={key} data={podsInfo.podsMap[key]} cluster={cluster} noMicroApp={!isWorkload} />
                      </TabPane>
                    ))
                  }
                </Tabs>
              )
              : <NoData titleID="pages.cluster.podsTable.nodata.title" descID="pages.cluster.podsTable.nodata.desc" />
          }
        </MaxSpace>
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(PodsPage);
