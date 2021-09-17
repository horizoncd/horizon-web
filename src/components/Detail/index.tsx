import {PageContainer} from '@ant-design/pro-layout';
import utils from '../../utils'
import {Link} from 'umi';
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Divider} from "antd";
import './index.less'
import {queryResource} from "@/services/core";

export default (props: any) => {
  const {initialState, setInitialState} = useModel('@@initialState');
  const itemRender = (route: Route) => {
    return <Link onClick={() => {
      queryResource(route.path).then(({data}) => {
        const resource: API.Resource = {};
        const {type = "group", id, name, path, fullName} = data;
        resource.id = id;
        resource.type = type;
        resource.name = name;
        resource.fullName = fullName;
        resource.path = path

        setInitialState((s) => ({...s, pathname: route.path, resource}))
      }).catch(() => {
        setInitialState((s) => ({...s, pathname: route.path, settings: {menuRender: false}}))
      })
    }} to={route.path}>{route.breadcrumbName}
    </Link>
  }
  return (
    <PageContainer
      header={{
        breadcrumb: {
          routes: utils.getBreadcrumb(initialState?.resource?.path, initialState?.resource?.fullName),
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
