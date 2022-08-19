import {useRequest} from 'umi';
import Footer from '@/components/Footer';
import {getAuthEndpoints} from '@/services/login/login';
import styles from './index.less';
import {history} from "@@/core/history";
import './index.less'
import {Button, Space} from "antd";

const Login = () => {

  const {data: endpoints} = useRequest(() => {
    return getAuthEndpoints(window.location.protocol+"//"+window.location.host+"/user/login/callback")
  })

  const handleURL = (u: string) => {
    const url = new URL(u)
    let state = url.searchParams.get('state')
    state = window.atob(state)

    const stateParams = new URLSearchParams(state)
    stateParams.set('redirect', history.location.query.redirect?? `${window.location.protocol}//${window.location.host}`)

    url.searchParams.set('state',window.btoa(stateParams.toString()))
    return url.toString()
  }

  return (
    <div className={styles.container} style={{backgroundColor: "black"}}>
      <div className={styles.content}>
        <div className={styles.contentBlock}>
          <div className={styles.textBlock}>
            <div className={styles.title}>Horizon ready for you</div>
            <div className={styles.description}>The platform for your cloudnative application delivery
            </div>
            <div className={styles.description}>for any kind of workload, webserver serverless middleware...</div>
            <Space>
            {
              endpoints?.map((endpoint) => {
                return <Button key={endpoint.displayName} className={styles.signInButton} onClick={async () => {
                  window.location.href = handleURL(endpoint.authURL)
                }}>Sign in with {endpoint.displayName}</Button>
              })
            }
            </Space>
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
