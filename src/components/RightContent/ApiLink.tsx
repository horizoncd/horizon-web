import { useIntl } from 'umi';

function ApiLink() {
  const intl = useIntl();
  return (
    <a
      style={{ color: 'white' }}
      href="/apis/swagger"
    >
      {intl.formatMessage({ id: 'pages.header.api' })}
    </a>
  );
}

export default ApiLink;
