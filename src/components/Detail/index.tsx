import { PageContainer } from '@ant-design/pro-layout';
import utils from '../../utils'
import {history, Link} from 'umi';
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Divider} from "antd";
import './index.less'

export default (props: any) => {
  const { pathname } = history.location;
  const { setInitialState } = useModel('@@initialState');
  const itemRender = (route: Route) => {
    return <Link onClick={() => setInitialState((s) => ({ ...s, pathname: route.path}))}
                 to={route.path}>{route.breadcrumbName}
    </Link>
  }

  return (
    <PageContainer
      header={{
        breadcrumb: {routes: utils.getBreadcrumb(pathname), itemRender},
      }}
      title={false}
    >
      <Divider className={'divider'}/>
      {props.children}
    </PageContainer>
  );
};
