import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { useMemo, useState } from 'react';
import { Popover, Tabs } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  getCluster, getClusterStatusV2, getClusterResourceTree, getStepV2, getClusterBuildStatusV2,
} from '@/services/clusters/clusters';
import { ClusterStatus, TaskStatus } from '@/const';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import { PageWithInitialState } from '@/components/Enhancement';
import { CenterSpin } from '@/components/Widget';
import { BuildStatus, refreshPodsInfo } from './util';
import PodsTable from '../PodsTable';
import StepCard from './SyncCard';
import { ButtonBar, ClusterCard } from '../components';
import BuildCard from './BuildCard';

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
  const [progressing, setProgressing] = useState<boolean>(false);
  const [building, setBuilding] = useState<BuildStatus>(BuildStatus.None);

  const { data: cluster } = useRequest(() => getCluster(id), {});

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
    ready: !!cluster,
  });

  const { data: clsuterBuildStatus, refresh: refreshBuildStatus } = useRequest(() => getClusterBuildStatusV2(id), {
    pollingInterval,
    onSuccess: (status) => {
      const taskStatus = status.runningTask.taskStatus as TaskStatus;
      // 2021.12.15 应用迁移到Horizon后，latestPipelinerun为null
      if (taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING) {
        setBuilding(BuildStatus.Running);
      } else if (taskStatus === TaskStatus.FAILED) {
        setBuilding(BuildStatus.Failed);
      } else {
        setBuilding(BuildStatus.None);
      }
    },
  });

  const { data: step, run: getStep, refresh: refreshStep } = useRequest(() => getStepV2(id), {
    manual: true,
  });

  const { data: clusterStatus, refresh: refreshCluster } = useRequest(() => getClusterStatusV2(id), {
    pollingInterval,
    onSuccess: () => {
      if (clusterStatus?.status === ClusterStatus.PROGRESSING) {
        setProgressing(true);
        getStep();
      } else {
        setProgressing(false);
      }
      if (clusterStatus?.status === ClusterStatus.FREED) {
        if (shouldAlertFreed) {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.hint' }));
          setShouldAlertFreed(false);
        }
      }
    },
  });

  const { data: resourceTree } = useRequest(() => getClusterResourceTree(id), {
    ready: !!clusterStatus && (clusterStatus.status !== ClusterStatus.FREED),
    pollingInterval,
  });

  const podsInfo = useMemo(() => refreshPodsInfo(resourceTree), [resourceTree]);

  if (!clusterStatus || !cluster || !env2DisplayName || !region2DisplayName) {
    return <CenterSpin />;
  }

  return (
    <PageWithBreadcrumb>
      <div>
        <ButtonBar cluster={cluster} clusterStatus={clusterStatus} manualPaused={step?.manualPaused ?? false} />
        <ClusterCard
          manualPaused={(step && step.manualPaused) ?? false}
          cluster={cluster}
          clusterStatus={clusterStatus}
          env2DisplayName={env2DisplayName}
          region2DisplayName={region2DisplayName}
          podsInfo={podsInfo}
        />
        {
          (clsuterBuildStatus && clsuterBuildStatus.latestPipelinerun
            && (building === BuildStatus.Failed || (!progressing && building === BuildStatus.Running))) && (
            <BuildCard
              pipelinerunID={clsuterBuildStatus.latestPipelinerun.id}
              runningTask={clsuterBuildStatus.runningTask}
            />
          )
        }
        {
          (progressing && building !== BuildStatus.Failed && step && step.index !== step.total) && (
            <StepCard
              step={step}
              refresh={() => { refreshStep(); refreshCluster(); refreshBuildStatus(); }}
              clusterStatus={clusterStatus}
            />
          )
        }
        {
          podsInfo.sortedKey.length >= 1 && (
          <Tabs
            defaultActiveKey={podsInfo.sortedKey[0]}
          >
            {
            podsInfo.sortedKey.map((key) => (
              <TabPane
                tab={<Popover content={key}>{getLastPattern(key)}</Popover>}
                key={key}
                tabKey={key}
              >
                <PodsTable key={key} data={podsInfo.podsMap[key]} cluster={cluster} />
              </TabPane>
            ))
          }
          </Tabs>
          )
        }
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(PodsPage);
