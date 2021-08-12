import {DefaultFooter, FooterProps} from '@ant-design/pro-layout';

export default (props: FooterProps) => {
  const defaultMessage = '2021 HORIZON @2021~2025 Horizon CloudNative Group';
  return (
    <DefaultFooter className={props.className}
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
