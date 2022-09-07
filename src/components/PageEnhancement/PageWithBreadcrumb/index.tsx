import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from '@@/plugin-model/useModel';
import { Alert, Divider } from 'antd';
import { PropsWithChildren, useEffect } from 'react';
import { history } from 'umi';
import styles from './index.less';
import './index.less';
import utils, { pathnameInStaticRoutes } from '../../utils';
import NotFount from '@/pages/404';
import WithTheme from '@/theme';

export default (props: PropsWithChildren<any>) => {
  const { children } = props;
  const { initialState } = useModel('@@initialState');
  const { fullName } = initialState!.resource;
  const isStaticRoute = pathnameInStaticRoutes();
  if (!isStaticRoute && !fullName) {
    return <NotFount />;
  }

  const { alert, clearAlert } = useModel('alert');

  const itemRender = (route: any) => {
    const { path, breadcrumbName, subResource } = route;
    if (subResource) {
      // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions
      return <a onClick={() => history.push(path)}>{breadcrumbName}</a>;
    }
    return <a href={path}>{breadcrumbName}</a>;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (alert.message) {
        clearAlert();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert, clearAlert]);

  return (
    <WithTheme>
      <div>
        {
        alert.message
        && (
        <Alert
          style={{
            position: 'sticky', top: 48, left: 0, zIndex: 999, background: alert.background,
          }}
          // @ts-ignore
          type={alert.type}
          message={alert.message}
          banner
          closable
          onClose={clearAlert}
        />
        )
      }
        <div className={styles.pageContainer}>
          <PageContainer
            header={{
              breadcrumb: {
                routes: utils.getBreadcrumbs(fullName),
                itemRender,
              },
            }}
            title={false}
          >
            <Divider className={styles.divider} />
            {children}
          </PageContainer>
        </div>
      </div>
    </WithTheme>
  );
};
