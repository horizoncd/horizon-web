import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const defaultMessage = '2021 HORIZON @2021~2025 Horizon CloudNative Group';
  return (
    <DefaultFooter
      copyright={`${defaultMessage}`}
      links={
        [
          // {
          //   key: 'Ant Design Pro',
          //   title: 'Ant Design Pro',
          //   href: 'https://pro.ant.design',
          //   blankTarget: true,
          // },
        ]
      }
    />
  );
};
