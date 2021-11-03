import {PageContainer} from '@ant-design/pro-layout';
import utils, {pathnameInStaticRoutes} from '../../utils'
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Divider} from "antd";
import styles from './index.less'

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const itemRender = (route: Route) => {
    return <a href={route.path}>{route.breadcrumbName}
    </a>
  }
  const {fullName} = initialState!.resource
  const staticRoute = pathnameInStaticRoutes()

  return (
    <div className={styles.pageContainer}>
      <PageContainer
        header={staticRoute ? {} : {
          breadcrumb: {
            routes: utils.getBreadcrumbs(fullName),
            itemRender
          },
        }}
        title={false}
      >
        {
          !staticRoute && <Divider className={styles.divider}/>
        }
        {props.children}
      </PageContainer>
    </div>
  );
};
