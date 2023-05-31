import {
  Card, Col, Divider, Row, Avatar,
} from 'antd';
import { useHistory, useIntl, useModel } from 'umi';
import styled from 'styled-components';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { MaxSpace, MicroApp } from '@/components/Widget';

const CardTitle = styled.span`
  font-size: 17px;
  font-weight: 550;
`;

const Title = styled.span`
  font-size: 20px;
  font-weight: 550;
`;

interface ItemCardProps {
  avatar: React.ReactNode;
  title: React.ReactNode;
  description: string;
  onClick: () => void;
}

const ItemCard = (props: ItemCardProps) => {
  const {
    avatar, title, description, onClick,
  } = props;
  return (
    <Card
      style={{ height: 150 }}
      hoverable
      onClick={onClick}
    >
      <Card.Meta
        avatar={avatar}
        title={title}
        description={description}
      />
    </Card>
  );
};

export default (props: any) => {
  const { location } = props;

  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();
  const { fullPath } = initialState!.resource;
  const newApplicationV2URL = `/groups${fullPath}/-/newapplicationv2`;
  const { pathname } = location;
  if (pathname.endsWith('/editv2')) {
    history.push(fullPath);
  }

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={16} offset={4}>
          <Row>
            <Col span={24}>
              <Title>{intl.formatMessage({ id: 'pages.groups.New application' })}</Title>
            </Col>
          </Row>
          <Divider />
          <MaxSpace
            direction="vertical"
            size="large"
          >
            <Card
              type="inner"
              title={(<CardTitle>{intl.formatMessage({ id: 'pages.application.navigation.appType' })}</CardTitle>)}
            >
              <Row gutter={[30, 30]}>
                <Col key="gitimport" span={12}>
                  <ItemCard
                    avatar={<Avatar src="/git.svg" />}
                    title={<span>{intl.formatMessage({ id: 'pages.application.navigation.gitImport' })}</span>}
                    description={intl.formatMessage({ id: 'pages.application.navigation.gitImport.desc' })}
                    onClick={() => history.push(`${newApplicationV2URL}/gitimport`)}
                  />
                </Col>
                <Col key="imagedeploy" span={12}>
                  <ItemCard
                    avatar={<Avatar src="/docker.svg" />}
                    title={<span>{intl.formatMessage({ id: 'pages.application.navigation.imageDeploy' })}</span>}
                    description={intl.formatMessage({ id: 'pages.application.navigation.imageDeploy.desc' })}
                    onClick={() => history.push(`${newApplicationV2URL}/imagedeploy`)}
                  />
                </Col>
                {/* <Col span={3} /> */}
              </Row>
            </Card>
            <MicroApp
              name="quickstart"
              fullpath={fullPath}
            />
          </MaxSpace>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
