import config from '@/config';

function DocsLink() {
  const { docs: { baseURL: baseURLStr } } = config;
  const baseURL = new URL(baseURLStr);

  return <a style={{ color: 'white' }} href={baseURL.toString()}>文档</a>;
}

export default DocsLink;
