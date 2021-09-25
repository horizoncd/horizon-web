import {PageContainer} from '@ant-design/pro-layout';
import utils from '../../utils'
import {Link} from 'umi';
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Divider} from "antd";
import './index.less'

export default (props: any) => {
  const {initialState, setInitialState} = useModel('@@initialState');
  const itemRender = (route: Route) => {
    return <a href={route.path}>{route.breadcrumbName}
    </a>
  }
  return (
    <PageContainer
      header={{
        breadcrumb: {
          routes: utils.getBreadcrumb(initialState?.resource.fullPath, initialState?.resource?.fullName),
          itemRender
        },
      }}
      title={false}
    >
      <Divider className={'divider'}/>
      {props.children}
    </PageContainer>
  );
};
