import React from 'react';
import { useIntl } from 'umi';
import { GlobalHeaderRightProps } from '@/components/RightContent/AvatarDropdown';

const ContactUs: React.FC<GlobalHeaderRightProps> = () => {
  const intl = useIntl();
  return (
    // popo web唤起链接获取指导参考：https://kms.netease.com/wiki/183/page/1392
    <a
      style={{ color: 'white' }}
      href="netease-popoapp://7b226f707373223a7b2273737470223a312c2273736964223a2231363938383831227d7d"
    >
      {intl.formatMessage({ id: 'pages.header.contactUs' })}
    </a>
  );
};

export default ContactUs;
