import { ConfigProvider } from 'antd';
import { useIntl, useModel } from 'umi';
import React, { useImperativeHandle, useRef } from 'react';
import ClusterCard from './ClusterCard';
import ClusterCardV2 from './ClusterCardV2'; // 将导入重命名为 ClusterCardV2
import Output from '../../Detail/Output';
import { Tag } from '../../Detail/Tag';
import { MaxSpace } from '@/components/Widget';

interface InfoMenuProps {
  manualPaused: boolean
  cluster: CLUSTER.ClusterV2 | CLUSTER.Cluster,
  clusterStatus: CLUSTER.ClusterStatusV2,
  env2DisplayName: Map<string, string>,
  region2DisplayName: Map<string, string>,
  podsInfo: any,
}

const InfoMenu = React.forwardRef((props: InfoMenuProps, ref) => {
  const { initialState } = useModel('@@initialState');
  const { fullPath: clusterFullPath } = initialState!.resource;
  const {
    manualPaused, cluster, clusterStatus, env2DisplayName,
    region2DisplayName, podsInfo,
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
                      />
                    ) : (
                      <ClusterCardV2 // 使用重命名后的名称
                        manualPaused={manualPaused}
                        cluster={cluster}
                        clusterStatus={clusterStatus}
                        env2DisplayName={env2DisplayName}
                        region2DisplayName={region2DisplayName}
                        podsInfo={podsInfo}
                      />
                    )
                }
          <Output ref={outputRef} clusterID={cluster.id} />
          <Tag clusterID={cluster.id} clusterFullPath={clusterFullPath} />
        </MaxSpace>
      </ConfigProvider>
    </div>
  );
});

export default InfoMenu;
