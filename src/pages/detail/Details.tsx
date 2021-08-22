import React from 'react';
import {Button, Card} from 'antd';
import utils from '../../utils'
import {history} from 'umi';
import Detail from '@/components/Detail'
import './index.less'

export default (): React.ReactNode => {
  const { pathname } = history.location;

  const resourceName = utils.getResourceName(pathname)
  const header = () => {
    return (<Button type="primary" style={{backgroundColor: '#1f75cb'}}>New subgroup</Button>)
  }

  const firstLetter = resourceName.substring(0, 1).toUpperCase()

  return (
    <Detail>
      <div
        className="gl-display-flex gl-justify-content-space-between gl-flex-wrap gl-sm-flex-direction-column gl-mb-3">
        <div className="home-panel-title-row gl-display-flex">
          <div
            className="avatar-container rect-avatar s64 home-panel-avatar gl-flex-shrink-0 gl-w-11 gl-h-11 gl-mr-3! float-none">
            <span className="avatar avatar-tile s64 identicon bg2">{firstLetter}</span>
          </div>
          <div className="d-flex flex-column flex-wrap align-items-baseline">
            <div className="d-inline-flex align-items-baseline">
              <h1
                className="home-panel-title gl-mt-3 gl-mb-2 gl-font-size-h1 gl-line-height-24 gl-font-weight-bold gl-ml-3"
                data-qa-selector="project_name_content" itemProp="name">
                {resourceName}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </Detail>
  );
};
