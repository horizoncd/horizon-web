import { useIntl } from 'umi';
import type { FooterProps } from '@ant-design/pro-layout';
import { DefaultFooter } from '@ant-design/pro-layout';

export default (props: FooterProps) => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '2021 HORIZON @2021~2025 Horizon CloudNative Group',
  });

  return <DefaultFooter className={props.className} copyright={defaultMessage} links={[]} />;
};
