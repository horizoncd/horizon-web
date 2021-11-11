import {PageContainer} from '@ant-design/pro-layout';
import utils, {pathnameInStaticRoutes} from '../../utils'
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Alert, Divider} from "antd";
import styles from './index.less'
import {history} from 'umi';

export default (props: any) => {
  const {initialState, refresh} = useModel('@@initialState');
  const {alert, clearAlert} = useModel('alert');

  const itemRender = (route: Route) => {
    return <a onClick={() => {
      history.push(route.path)
      refresh()
    }}>{route.breadcrumbName}
    </a>
  }
  const {fullName} = initialState!.resource
  const staticRoute = pathnameInStaticRoutes()

  return (
    <div>
      {
        // @ts-ignore
        alert.message &&  <Alert type={alert.type} message={alert.message} banner closable onClose={clearAlert}/>
      }
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
    </div>
  );
};
