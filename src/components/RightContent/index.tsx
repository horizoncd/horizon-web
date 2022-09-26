import { Space } from 'antd';
import React from 'react';
import { useModel } from 'umi';
import ApiLink from './ApiLink';
import Avatar from './AvatarDropdown';
import ContactUs from './ContactUs';
import DocsLink from './DocsLink';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      <ApiLink />
      <DocsLink />
      <ContactUs />
      <Avatar />
      {/*<SelectLang className={styles.action}/>*/}
    </Space>
  );
};

export default GlobalHeaderRight;
