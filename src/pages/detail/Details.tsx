import React from 'react';
import {Button, Divider, Input, Tabs, Tree} from 'antd';
import utils from '../../utils'
import {history, Link} from 'umi';
import Detail from '@/components/Detail'
import './index.less'
import {DownOutlined} from "@ant-design/icons";
import {useModel} from "@@/plugin-model/useModel";

const { DirectoryTree } = Tree;
const { Search } = Input;
const { TabPane } = Tabs;

export default (): React.ReactNode => {
  const { groups, queryGroup } = useModel('groups', (model) => ({
    groups: model.groups,
    queryGroup: model.queryGroup,
  }));
  queryGroup();

  const { pathname } = history.location;

  const resourceName = utils.getResourceName(pathname)
  const header = () => {
    return (
      <div>
        <Button style={{marginRight: 15}}>New group</Button>
        <Button type="primary" style={{backgroundColor: '#1f75cb'}}>New application</Button>
      </div>
    )
  }
  const onChange = () => {

  }
  const onExpand = () => {

  }
  const titleRender = (nodeData: any): React.ReactNode => {
    const { title, path } = nodeData;

    return <Link to={path}><span className={'group-title'}>{title}</span></Link>;
  };
  const query = <Search placeholder="Search" onChange={onChange} />;

  const firstLetter = resourceName.substring(0, 1).toUpperCase()

  return (
    <Detail>
      <div className="gl-display-flex gl-justify-content-space-between gl-flex-wrap gl-sm-flex-direction-column gl-mb-3">
        <div className="home-panel-title-row gl-display-flex">
          <div className="avatar-container rect-avatar s64 home-panel-avatar gl-flex-shrink-0 gl-w-11 gl-h-11 gl-mr-3! float-none">
            <span className="avatar avatar-tile s64 identicon bg2">{firstLetter}</span>
          </div>
          <div className="d-flex flex-column flex-wrap align-items-baseline">
            <div className="d-inline-flex align-items-baseline">
              <h1
                className="home-panel-title gl-mt-3 gl-mb-2 gl-font-size-h1 gl-line-height-24 gl-font-weight-bold gl-ml-3">
                {resourceName}
              </h1>
            </div>
          </div>
        </div>
        {header()}
      </div>
      <Divider className={'group-divider'} />
      <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={query}>
        <TabPane tab="Subgroups and applications" key="1">
          {groups.map((item: API.Group) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <div key={item.title}>
                <DirectoryTree
                  onExpand={onExpand}
                  showLine={hasChildren ? { showLeafIcon: false } : false}
                  switcherIcon={<DownOutlined />}
                  treeData={[item]}
                  titleRender={titleRender}
                />
                <Divider style={{ margin: '0' }} />
              </div>
            );
          })}
        </TabPane>
      </Tabs>
    </Detail>
  );
};
