import {PageContainer} from '@ant-design/pro-layout';
import utils from '../../utils'
import type {Route} from "antd/lib/breadcrumb/Breadcrumb";
import {useModel} from "@@/plugin-model/useModel";
import {Divider} from "antd";
import './index.less'

export default (props: any) => {
    const {initialState} = useModel('@@initialState');
    const itemRender = (route: Route) => {
        return <a href={route.path}>{route.breadcrumbName}
        </a>
    }
    const {fullName} = initialState!.resource
    return (
        <PageContainer
            header={{
                breadcrumb: {
                    routes: utils.getBreadcrumbs(fullName),
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
