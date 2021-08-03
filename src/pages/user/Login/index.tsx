import React from 'react';
import ProForm from '@ant-design/pro-form';
import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import { pmsLogin } from '@/services/ant-design-pro/login';
import styles from './index.less';

const Login: React.FC = () => {
  const handleSubmit = async () => {
    // 登录
    const { query } = history.location;
    const { redirect } = query as {
      redirect: string;
    };
    const { data } = await pmsLogin({
      redirectUrl: redirect || '/',
      fromHost: window.location.host,
    });
    window.location.href = data;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <h1 className={styles.title}>HORIZON</h1>
            </Link>
          </div>
        </div>

        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: 'OpenID 登录',
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async () => {
              handleSubmit();
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
