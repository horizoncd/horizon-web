import { useIntl } from 'umi';

function DocsLink() {
  const intl = useIntl();
  return (
    <a
      style={{ color: 'white' }}
      href="/horizon-docs"
    >
      {intl.formatMessage({ id: 'pages.header.docs' })}
    </a>
  );
}

export default DocsLink;
