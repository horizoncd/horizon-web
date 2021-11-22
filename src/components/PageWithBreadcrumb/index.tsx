import {PageContainer} from '@ant-design/pro-layout';
import utils, {pathnameInStaticRoutes} from '../../utils'
import {useModel} from "@@/plugin-model/useModel";
import {Alert, Divider} from "antd";
import styles from './index.less'
import './index.less'
import {useEffect} from "react";
import {history} from 'umi';

export default (props: any) => {
  const {initialState} = useModel('@@initialState');
  const {alert, clearAlert} = useModel('alert');

  const itemRender = (route: any) => {
    const {path, breadcrumbName, subResource} = route;
    if (subResource) {
      return <a onClick={() => history.push(path)}>{breadcrumbName}
      </a>
    }
    return <a href={path}>{breadcrumbName}
    </a>;
  }
  const {fullName} = initialState!.resource
  const staticRoute = pathnameInStaticRoutes()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (alert.message) {
        clearAlert()
      }
    }, 4000);

    return () => timer && clearTimeout(timer);
  });

  return (
    <div>
      {
        alert.message &&
        <Alert style={{position: 'sticky', top: 48, left: 0, zIndex: 999, background: alert.background}}
          // @ts-ignore
               type={alert.type} message={alert.message} banner closable onClose={clearAlert}/>
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
