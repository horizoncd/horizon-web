import { Button, Divider } from 'antd';
import utils from '../../../utils';
import { history } from 'umi';
import Detail from '@/components/PageWithBreadcrumb';
import './index.less';
import GroupTree from '@/components/GroupTree';
import { stringify } from 'querystring';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';

export default () => {
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const { id, name = '' } = initialState?.resource || {};
  const newGroup = '/groups/new';
  const newApplication = '/applications/new';

  const header = () => {
    return (
      <div>
        <Button
          style={{ marginRight: 15 }}
          onClick={() =>
            history.push({
              pathname: newGroup,
              search: stringify({
                parentID: id,
              }),
            })
          }
        >
          {intl.formatMessage({ id: 'pages.groups.New subgroup' })}
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: '#1f75cb' }}
          onClick={() => {
            history.push({
              pathname: newApplication,
              search: stringify({
                parentID: id,
              }),
            });
          }}
        >
          {intl.formatMessage({ id: 'pages.groups.New application' })}
        </Button>
      </div>
    );
  };

  const firstLetter = name.substring(0, 1).toUpperCase();

  return (
    <Detail>
      <div className="gl-display-flex gl-justify-content-space-between gl-flex-wrap gl-sm-flex-direction-column gl-mb-3 align-items-center">
        <div className="home-panel-title-row gl-display-flex align-items-center">
          <div className="avatar-container rect-avatar s64 home-panel-avatar gl-flex-shrink-0 gl-w-11 gl-h-11 gl-mr-3! float-none">
            <span
              className={`avatar avatar-tile s64 identicon bg${utils.getAvatarColorIndex(name)}`}
            >
              {firstLetter}
            </span>
          </div>
          <div className="d-flex flex-column flex-wrap align-items-baseline">
            <div className="d-inline-flex align-items-baseline">
              <h1 className="home-panel-title gl-mt-3 gl-mb-2 gl-font-size-h1 gl-line-height-24 gl-font-weight-bold gl-ml-3">
                {name}
              </h1>
            </div>
          </div>
        </div>
        {header()}
      </div>
      <Divider className={'group-divider'} />
      <GroupTree groupID={id} tabPane={'Subgroups and applications'} />
    </Detail>
  );
};
