import { ConfigProvider } from 'antd';
import { useIntl, useModel, useRequest } from 'umi';
import React, { useImperativeHandle, useRef } from 'react';
import ClusterCard from './ClusterCard';
import ClusterCardV2 from './ClusterCardV2'; // 将导入重命名为 ClusterCardV2
import Output from '../../Detail/Output';
import { Tag } from '../../Detail/Tag';
import { MaxSpace } from '@/components/Widget';
import { listPipelineRuns } from '@/services/clusters/clusters';

interface InfoMenuProps {
  manualPaused: boolean
  cluster: CLUSTER.ClusterV2 | CLUSTER.Cluster,
  clusterStatus: CLUSTER.ClusterStatusV2,
  env2DisplayName: Map<string, string>,
  region2DisplayName: Map<string, string>,
  podsInfo: any,
  showOutputTags?: boolean,
}

const InfoMenu = React.forwardRef((props: InfoMenuProps, ref) => {
  const { initialState } = useModel('@@initialState');
  const { fullPath: clusterFullPath } = initialState!.resource;
  const {
    manualPaused, cluster, clusterStatus, env2DisplayName,
    region2DisplayName, podsInfo, showOutputTags = false,
  } = props;
  const outputRef = useRef();
  const intl = useIntl();
  useImperativeHandle(ref, () => ({
    refreshOutput: () => {
      if (outputRef.current) {
        outputRef.current.refresh();
      }
    },
  }));
  const [unmergedPipelineCount, setUnmergedPipelineCount] = React.useState(0);

  useRequest(() => listPipelineRuns(cluster.id, {
    pageNumber: 1, pageSize: 10, canRollback: false,
  }), {
    onSuccess: (data) => {
      let count = 0;
      for (let i = 0; i < data.items.length; i += 1) {
        if (data.items[i].status === 'pending' || data.items[i].status === 'ready') {
          count += 1;
        }
      }
      setUnmergedPipelineCount(count);
    },
  });

  return (
    <div>
      <ConfigProvider renderEmpty={() => <span>{intl.formatMessage({ id: 'pages.common.nodata' })}</span>}>
        <MaxSpace direction="vertical" size="large">
          {
            cluster.version === 1 ? (
              <ClusterCard
                manualPaused={manualPaused}
                cluster={cluster}
                clusterStatus={clusterStatus}
                env2DisplayName={env2DisplayName}
                region2DisplayName={region2DisplayName}
                podsInfo={podsInfo}
                unmergedPipelineCount={unmergedPipelineCount}
              />
            ) : (
              <ClusterCardV2 // 使用重命名后的名称
                manualPaused={manualPaused}
                cluster={cluster}
                clusterStatus={clusterStatus}
                env2DisplayName={env2DisplayName}
                region2DisplayName={region2DisplayName}
                podsInfo={podsInfo}
                unmergedPipelineCount={unmergedPipelineCount}
              />
            )
          }
          {
            showOutputTags && (
              <>
                <Output ref={outputRef} clusterID={cluster.id} />
                <Tag clusterID={cluster.id} clusterFullPath={clusterFullPath} />
              </>
            )
          }
        </MaxSpace>
      </ConfigProvider>
    </div>
  );
});

export default InfoMenu;
