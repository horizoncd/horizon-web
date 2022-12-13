import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { useMemo, useState } from 'react';
import { Popover, Tabs } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  getCluster, getClusterStatusV2, getClusterResourceTree, getStepV2,
} from '@/services/clusters/clusters';
import { ClusterStatus } from '@/const';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import { PageWithInitialState } from '@/components/Enhancement';
import { CenterSpin } from '@/components/Widget';
import { refreshPodsInfo } from './util';
import PodsTable from '../PodsTable';
import StepCard from './SyncCard';
import { ButtonBar, ClusterCard } from '../components';

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

  const { data: clusterStatus, refresh: refreshCluster } = useRequest(() => getClusterStatusV2(id), {
    pollingInterval,
    onSuccess: () => {
      if (clusterStatus?.status === ClusterStatus.PROGRESSING) {
        setProgressing(true);
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

  const { data: step, refresh: refreshStep } = useRequest(() => getStepV2(id), {
    ready: progressing,
    pollingInterval,
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
        <ButtonBar cluster={cluster} clusterStatus={clusterStatus} />
        <ClusterCard
          manualPaused={(step && step.manualPaused) ?? false}
          cluster={cluster}
          clusterStatus={clusterStatus}
          env2DisplayName={env2DisplayName}
          region2DisplayName={region2DisplayName}
          podsInfo={podsInfo}
        />
        <StepCard step={step} refresh={() => { refreshStep(); refreshCluster(); }} clusterStatus={clusterStatus} />
        <Tabs>
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
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(PodsPage);
