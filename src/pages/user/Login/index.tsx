import {history} from 'umi';
import Footer from '@/components/Footer';
import {login} from '@/services/login/login';
import styles from './index.less';
import './index.less'
import {Button} from "antd";

const Login = () => {
  const handleSubmit = async () => {
    const {query} = history.location;
    const {redirect} = query as {
      redirect: string;
    };
    const {data} = await login({
      redirectUrl: redirect || '/',
      fromHost: window.location.host,
    });
    window.location.href = data;
  };

  return (
    <div className={styles.container} style={{backgroundColor: "black"}}>
      <div className={styles.content}>
        <div className={styles.contentBlock}>
          <div className={styles.textBlock}>
            <div className={styles.title}>Horizon ready for you</div>
            <div className={styles.description}>The platform for your cloudnative application delivery
            </div>
            <div className={styles.description}>for any kind of workload, webserver serverless middleware...</div>
            <Button className={styles.signInButton} onClick={async () => {
              handleSubmit();
            }}>Sign in for Horizon</Button>
          </div>
          <div style={{textAlign: "center", alignSelf: "center"}}>
            <div>
              <img
                className={styles.imgBlock}
                src="/The_Earth_seen_from_Apollo_17.jpg"/>
            </div>
            <div className={styles.comment}>Blue Marble, taken by the Apollo 17, December 7, 1972</div>
          </div>
        </div>
      </div>
      <div>
        <Footer className="ant-layout-footer-login"/>
      </div>
    </div>
  );
};

export default Login;
