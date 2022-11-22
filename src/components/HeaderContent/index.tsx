/* eslint-disable */
import { history, useIntl, useModel } from 'umi';
import { Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons/lib';

const { SubMenu } = Menu;

const GlobalHeaderContent: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  return (
    <Menu mode="horizontal" theme="dark" style={{ marginLeft: '10px', color: '#989898' }} selectable={false}>
      <Menu.Item key="1">
        <a
          style={{ fontWeight: 'bold' }} onClick={() => history.push('/dashboard/clusters')}
        >
          {intl.formatMessage({ id: 'pages.header.clusters' })}
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <a
          style={{ fontWeight: 'bold' }} onClick={() => history.push('/dashboard/applications')}
        >
          {intl.formatMessage({ id: 'pages.header.applications' })}
        </a>
      </Menu.Item>
      <Menu.Item key="3">
        <a
          style={{ fontWeight: 'bold' }} onClick={() => history.push('/explore/groups')}
        >
          {intl.formatMessage({ id: 'pages.header.groups' })}
        </a>
      </Menu.Item>
      <Menu.Item key="7">
        <a
          style={{ fontWeight: 'bold' }} onClick={() => history.push('/templates')}
        >
          {intl.formatMessage({ id: 'pages.header.templates' })}
        </a>
      </Menu.Item>
      <SubMenu
        key="4"
        title={(
          <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.65)' }}>
            {intl.formatMessage({ id: 'pages.header.more' })}
            {' '}
            <DownOutlined style={{ fontSize: 'x-small', color: 'rgba(255, 255, 255, 0.65)' }} />
          </span>
        )}
      >
        <Menu.Item key="5">
          <a
            style={{ fontWeight: 'bold' }}
            href="/slo"
          >
            {intl.formatMessage({ id: 'pages.header.more.slo' })}
          </a>
        </Menu.Item>
        {
            initialState?.currentUser?.isAdmin && (
            <Menu.Item key="6">
              <a
                style={{ fontWeight: 'bold' }}
                href="/admin"
              >
                {intl.formatMessage({ id: 'pages.header.more.admin' })}
              </a>
            </Menu.Item>
            )
          }
      </SubMenu>
    </Menu>
  );
};

export default GlobalHeaderContent;
