import ProForm from '@ant-design/pro-form';
import { history, Link } from 'umi';
import Footer from '@/components/Footer';
import { login } from '@/services/login/login';
import styles from './index.less';
import { Col, Row } from 'antd';

const Login = () => {
  const handleSubmit = async () => {
    const { query } = history.location;
    const { redirect } = query as {
      redirect: string;
    };
    const { data } = await login({
      redirectUrl: redirect || '/',
      fromHost: window.location.host,
    });
    window.location.href = data;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Row>
          <Col span={10}>
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
          </Col>
          <Col span={13}>
            <img width="100%" src="/f1011482851d87df78c503700a06198c.jpeg" />
          </Col>
        </Row>
      </div>
      <div style={{ backgroundColor: 'transparent' }}>
        <Footer className="ant-layout-footer-login" />
      </div>
    </div>
  );
};

export default Login;
