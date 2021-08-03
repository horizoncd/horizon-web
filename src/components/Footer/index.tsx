import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const defaultMessage = 'HORIZON @2021~2025 Horizon CloudNative Group';
  return (
    <DefaultFooter
      copyright={`2020 ${defaultMessage}`}
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
