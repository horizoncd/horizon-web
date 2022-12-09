import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { useMemo, useState } from 'react';
import { Tabs } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { getCluster, getClusterStatusV2 } from '@/services/clusters/clusters';
import { ClusterStatus } from '@/const';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import { PageWithInitialState } from '@/components/Enhancement';
import { CenterSpin } from '@/components/Widget';
import { refreshPodsInfo } from './util';
import PodsTable from '../PodsTable';
import SyncCard from './SyncCard';
import { ButtonBar, ClusterCard } from '../components';

const { TabPane } = Tabs;

const pollingInterval = 6000;

interface PodsPageProps {
  initialState: API.InitialState,
}

function PodsPage(props: PodsPageProps) {
  const intl = useIntl();
  const { initialState: { resource: { id, parentID: applicationID } } } = props;
  const { successAlert } = useModel('alert');
  const [shouldAlertFreed, setShouldAlertFreed] = useState(true);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>();

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

  const { data: clusterStatus, run: refreshStatus } = useRequest(() => getClusterStatusV2(id), {
    pollingInterval,
    onSuccess: () => {
      if (clusterStatus?.status === ClusterStatus.FREED) {
        if (shouldAlertFreed) {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.hint' }));
          setShouldAlertFreed(false);
        }
      }
    },
  });

  const podsInfo = useMemo(() => refreshPodsInfo(clusterStatus), [clusterStatus]);

  if (!clusterStatus || !cluster || !env2DisplayName || !region2DisplayName) {
    return <CenterSpin />;
  }

  const { revision } = clusterStatus;

  return (
    <PageWithBreadcrumb>
      <div>
        <ButtonBar cluster={cluster} clusterStatus={clusterStatus} />
        <ClusterCard
          cluster={cluster}
          clusterStatus={clusterStatus}
          env2DisplayName={env2DisplayName}
          region2DisplayName={region2DisplayName}
          podsInfo={podsInfo}
        />
        <SyncCard clusterStatus={clusterStatus} refreshStatus={refreshStatus} />
        <Tabs
          defaultActiveKey={revision}
        >
          {
            podsInfo.currentPods.length > 0 && (
              <TabPane
                tab={`${revision} (Current)`}
                key={revision}
                tabKey={revision}
              >
                <PodsTable key={revision} data={podsInfo.currentPods} cluster={cluster} />
              </TabPane>
            )
          }
          {
            Object.keys(podsInfo.podsMap).map((key) => (
              <TabPane
                tab={key}
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
