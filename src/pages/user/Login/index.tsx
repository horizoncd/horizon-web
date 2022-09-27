import { useRequest } from 'umi';
import { Button, Space } from 'antd';
import Footer from '@/components/Footer';
import { getAuthEndpoints } from '@/services/idp/idp';
import styles from './index.less';
import './index.less';
import { IdpSetState } from '@/utils';

const Login = () => {
  const { data: endpoints } = useRequest(() => getAuthEndpoints());

  return (
    <div className={styles.container} style={{ backgroundColor: 'black' }}>
      <div className={styles.content}>
        <div className={styles.contentBlock}>
          <div className={styles.textBlock}>
            <div className={styles.title}>Horizon ready for you</div>
            <div className={styles.description}>
              The platform for your cloudnative application delivery
            </div>
            <div className={styles.description}>for any kind of workload, webserver serverless middleware...</div>
            <Space>
              {
                endpoints?.map((endpoint) => (
                  <Button
                    key={endpoint.displayName}
                    className={styles.signInButton}
                    onClick={async () => {
                      window.location.href = IdpSetState(endpoint.authURL);
                    }}
                  >
                    Sign in with
                    {' '}
                    {endpoint.displayName}
                  </Button>
                ))
              }
            </Space>
          </div>
          <div style={{ textAlign: 'center', alignSelf: 'center' }}>
            <div>
              <img
                className={styles.imgBlock}
                alt=""
                src="/The_Earth_seen_from_Apollo_17.jpg"
              />
            </div>
            <div className={styles.comment}>Blue Marble, taken by the Apollo 17, December 7, 1972</div>
          </div>
        </div>
      </div>
      <div>
        <Footer className="ant-layout-footer-login" />
      </div>
    </div>
  );
};

export default Login;
