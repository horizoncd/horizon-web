import React, { useCallback } from 'react';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, Spin } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { history, useModel } from 'umi';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { outLogin } from '@/services/login/login';
import { handleHref } from '@/utils';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const logout = async () => {
  await outLogin();
  const { query = {}, pathname } = history.location;
  const { redirect } = query;
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: `${window.location.protocol}//${window.location.host}${pathname}`,
      }),
    });
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();
  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        // @ts-ignore
        setInitialState((s) => ({ ...s, currentUser: undefined }));
        logout();
      }
      if (key === 'profile') {
        handleHref(event.domEvent, '/profile/user');
      }
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || (currentUser.fullName === undefined && currentUser.name === undefined)) {
    return loading;
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="profile">
        <UserOutlined />
        {intl.formatMessage({ id: 'pages.profile.entry' })}
      </Menu.Item>
      <Menu.Divider />
      {menu && (
        <Menu.Item key="settings">
          <SettingOutlined />
          {intl.formatMessage({ id: 'pages.profile.setting' })}
        </Menu.Item>
      )}

      {menu && <Menu.Divider />}

      <Menu.Item key="logout">
        <LogoutOutlined />
        {intl.formatMessage({ id: 'pages.profile.exit' })}
      </Menu.Item>
    </Menu>
  );
  return (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        <span className={`${styles.name} anticon`}>{currentUser.fullName ?? currentUser.name}</span>
      </span>
    </HeaderDropdown>
  );
};

AvatarDropdown.defaultProps = {
  menu: false,
};

export default AvatarDropdown;
