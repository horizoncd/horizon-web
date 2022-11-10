import { useIntl } from 'umi';
import type { FooterProps } from '@ant-design/pro-layout';
import { DefaultFooter } from '@ant-design/pro-layout';

export default (props: FooterProps) => {
  const { className } = props;
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '2022 HORIZON @2021~2025 Horizon CloudNative Group',
  });

  return <DefaultFooter className={className} copyright={defaultMessage} links={[]} />;
};
