import { useIntl, useRequest } from 'umi';
import { history } from '@@/core/history';
import {
  Button, ButtonProps, Form, Input,
} from 'antd';
import React, {
  PropsWithChildren,
  ReactNode, useCallback, useState,
} from 'react';
import CryptoJS from 'crypto-js';
import styled from 'styled-components';
import Footer from '@/components/Footer';
import { getAuthEndpoints, loginByPasswd } from '@/services/login/login';
import styles from './index.less';
import './index.less';
import { API } from '@/services/typings';
import { BoldText } from '@/components/Widget';
import WithTheme from '@/theme';

const redirectURL = `${window.location.protocol}//${window.location.host}/user/login/callback`;
const { Item } = Form;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const FullScreen = styled(CenterBox)`
  width: 100%;
  height: 100%;
  position: absolute;
`;

const Card = styled.div`
  position: relative;
  width: 300px;
  height: 321.6px;
  background-color: white;
  border-radius: 7px;
  background-color: #F6F8FA;
  border: 1px solid #D8DEE4;
`;

const RightBottom = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
`;

const PaddingBox = styled.div`
  padding: 30px;
`;

const Title = styled.h1`
  margin-top: 10px;
  margin-bottom: 20px;
`;

const CircleAvatar = styled.div`
  width: 60px;
  height: 60px;
  font-size: 50px;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  color: white;
  background-color: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface OidcLoginProps {
  endpoints: API.AuthEndpoint[],
}
function OidcLogin(props: OidcLoginProps) {
  const { endpoints } = props;

  const handleURL = (u: string) => {
    const url = new URL(u);
    let state = url.searchParams.get('state');
    state = window.atob(state!);

    const stateParams = new URLSearchParams(state);
    //@ts-ignore
    stateParams.set('redirect', history.location.query.redirect ?? `${window.location.protocol}//${window.location.host}`);

    url.searchParams.set('state', window.btoa(stateParams.toString()));
    url.searchParams.set('redirect_uri', redirectURL);
    return url.toString();
  };

  return (
    <PaddingBox
      style={
      {
        width: '100%',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }
    }
    >
      {
        endpoints?.map((endpoint) => (
          <Button
            key={endpoint.displayName}
            className={styles.signInButton}
            onClick={async () => {
              window.location.href = handleURL(endpoint.authURL);
            }}
          >
            Sign in with
            {` ${endpoint.displayName}`}
          </Button>
        ))
      }
    </PaddingBox>
  );
}

const MiddleBoldText = styled(BoldText)`
    font-size: ${(props: { theme: Theme }) => props.theme.fontSize.medium};
`;

function PasswordLogin() {
  const { run } = useRequest((userCred) => loginByPasswd(userCred), {
    onSuccess: () => {
      //@ts-ignore
      const { redirect } = history.location.query;
      window.location.href = redirect;
    },
    manual: true,
  });

  const onSubmit = async (data: { email: string, password: string }) => {
    run({ email: data.email, password: CryptoJS.SHA256(data.password).toString() });
  };

  return (
    <PaddingBox>
      <Form
        layout="vertical"
        onFinish={onSubmit}
      >
        <Item
          label="email"
          name="email"
          required={false}
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Item>
        <Item
          label="password"
          name="password"
          required={false}
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Item>
        <Button
          htmlType="submit"
          style={{
            height: '32px',
            width: '100%',
            fontSize: '15px',
            backgroundColor: 'green',
            borderWidth: 0,
            color: 'white',
          }}
        >
          <MiddleBoldText>
            Login
          </MiddleBoldText>
        </Button>
      </Form>
    </PaddingBox>
  );
}

enum LoginMethod {
  password = 0, oidc = 1,
}

const LinkButton = (props: PropsWithChildren<ButtonProps & { selected: boolean }>) => {
  const {
    type, children, selected, ...restProps
  } = props;
  const style = { textDecoration: 'underline' };
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button {...restProps} type="link">
      <span style={selected ? style : {}}>{children}</span>
    </Button>
  );
};

const LoginLinkButton = styled(LinkButton)`
  padding: 0px; 
  padding-left: 10px;
  padding-right: 5px; 
`;

interface LoginProps {
  button: React.ReactNode
}
function Login(props: LoginProps) {
  const { button } = props;

  const intl = useIntl();
  const [method, setMethod] = useState<LoginMethod>(LoginMethod.password);
  const [hasOIDC, setHasOIDC] = useState(false);
  const { data: endpoints } = useRequest(() => getAuthEndpoints(), {
    onSuccess: (data) => {
      const t = data.length !== undefined && data.length > 0;
      setMethod(t ? LoginMethod.oidc : LoginMethod.password);
      setHasOIDC(t);
    },
  });

  return (
    <FullScreen>
      <CircleAvatar>H</CircleAvatar>
      <Title>Sign in to Horizon</Title>
      <Card>
        {button}
        {method === LoginMethod.oidc && <OidcLogin endpoints={endpoints!} />}
        {method === LoginMethod.password && <PasswordLogin />}
        <RightBottom>
          <LoginLinkButton
            selected={method === LoginMethod.password}
            onClick={() => setMethod(LoginMethod.password)}
          >
            {intl.formatMessage({ id: 'pages.login.passwordLogin' })}
          </LoginLinkButton>
          {
                hasOIDC && (
                <LoginLinkButton
                  selected={method === LoginMethod.oidc}
                  onClick={() => setMethod(LoginMethod.oidc)}
                >
                  {intl.formatMessage({ id: 'pages.login.oidcLogin' })}
                </LoginLinkButton>
                )
              }
        </RightBottom>
      </Card>
      <div style={{ display: 'inline-block', height: '100px' }} />
    </FullScreen>
  );
}

interface HomeProps {
  button: React.ReactNode
}
function Home(props: HomeProps) {
  const { button } = props;

  return (
    <div className={styles.container} style={{ backgroundColor: 'black' }}>
      <div className={styles.content}>
        <div style={{ float: 'right', margin: '12px' }}>{button}</div>
        <div className={styles.contentBlock}>
          <div className={styles.textBlock}>
            <div className={styles.title}>Horizon ready for you</div>
            <div className={styles.description}>
              The platform for your cloudnative application delivery
            </div>
            <div className={styles.description}>for any kind of workload, webserver serverless middleware...</div>
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
}

enum State {
  login, home,
}

const Page = () => {
  const [chosen, setChosen] = useState<State>(State.home);

  const SwitchButton = useCallback((label: ReactNode) => (
    <Button
      type="link"
      style={chosen === State.home ? { color: 'white' } : {}}
      onClick={() => { if (chosen === State.home) setChosen(State.login); else setChosen(State.home); }}
    >
      {label}
    </Button>
  ), [chosen]);

  return (
    <WithTheme>
      {
        chosen === State.home && (
          <Home button={SwitchButton(<BoldText>Login</BoldText>)} />
        )
      }
      {
        chosen === State.login && (
          <Login button={null} />
        )
      }
    </WithTheme>
  );
};

export default Page;
