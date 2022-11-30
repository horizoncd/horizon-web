/* eslint-disable */
import { history, useIntl, useModel } from 'umi';
import { Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons/lib';
import { BoldText } from '@/components/Widget';

const { SubMenu } = Menu;

const GlobalHeaderContent: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  return (
    <Menu
      mode="horizontal"
      theme="dark"
      style={{ marginLeft: '10px', color: '#989898' }}
      selectable={false}
    >
      <Menu.Item key="1">
        <a onClick={() => history.push('/dashboard/clusters')}>
          <BoldText>{intl.formatMessage({ id: 'pages.header.clusters' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <a onClick={() => history.push('/dashboard/applications')}>
          <BoldText>{intl.formatMessage({ id: 'pages.header.applications' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="3">
        <a onClick={() => history.push('/dashboard/groups')}>
          <BoldText>{intl.formatMessage({ id: 'pages.header.groups' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="7">
        <a onClick={() => history.push('/templates')}>
          <BoldText>{intl.formatMessage({ id: 'pages.header.templates' })}</BoldText>
        </a>
      </Menu.Item>
      <SubMenu
        key="4"
        title={(
          <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.65)' }}>
            {intl.formatMessage({ id: 'pages.common.more' })}
            {' '}
            <DownOutlined style={{ fontSize: 'x-small', color: 'rgba(255, 255, 255, 0.65)' }} />
          </span>
        )}
      >
        <Menu.Item key="5">
          <a href="/slo">
            <BoldText>{intl.formatMessage({ id: 'pages.header.slo' })}</BoldText>
          </a>
        </Menu.Item>
        {
            initialState?.currentUser?.isAdmin && (
            <Menu.Item key="6">
              <a href="/admin">
                <BoldText>{intl.formatMessage({ id: 'pages.header.admin' })}</BoldText>
              </a>
            </Menu.Item>
            )
          }
      </SubMenu>
    </Menu>
  );
};

export default GlobalHeaderContent;
