import { useIntl, useModel } from 'umi';
import { Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons/lib';
import { BoldText } from '@/components/Widget';
import { PageWithTheme } from '../Enhancement';

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
        <a href="/dashboard/clusters">
          <BoldText>{intl.formatMessage({ id: 'pages.header.clusters' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="/dashboard/applications">
          <BoldText>{intl.formatMessage({ id: 'pages.header.applications' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="3">
        <a href="/dashboard/groups">
          <BoldText>{intl.formatMessage({ id: 'pages.header.groups' })}</BoldText>
        </a>
      </Menu.Item>
      <Menu.Item key="7">
        <a href="/templates">
          <BoldText>{intl.formatMessage({ id: 'pages.header.templates' })}</BoldText>
        </a>
      </Menu.Item>
      {
        initialState?.currentUser?.isAdmin && (
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
            <Menu.Item key="6">
              <a href="/admin">
                <BoldText>{intl.formatMessage({ id: 'pages.header.admin' })}</BoldText>
              </a>
            </Menu.Item>
          </SubMenu>
        )
      }
    </Menu>
  );
};

export default PageWithTheme(GlobalHeaderContent);
