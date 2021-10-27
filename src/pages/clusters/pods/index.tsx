import {Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {getCluster, getClusterStatus} from "@/services/clusters/clusters";

const {TabPane} = Tabs;

export default () => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id, name} = initialState!.resource;

  const {data: cluster} = useRequest(() => getCluster(id));
  const {data: status} = useRequest(() => getClusterStatus(id), {});

  if (status) {
    const version = status.clusterStatus.podTemplateHash;

    Object.keys(status.clusterStatus.versions).forEach(item => {
      // filter new/old pods

    })
  }


  return (
    <PageWithBreadcrumb>
      <Tabs defaultActiveKey="pods" size={'large'}>
        <TabPane tab="Pods" key="pods">
          <PodsTable/>
        </TabPane>
      </Tabs>
    </PageWithBreadcrumb>
  )
}
