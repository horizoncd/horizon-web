import {
  Button, Card, Col, Divider, Row, Tooltip,
} from 'antd';
import { useHistory, useModel } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

export default () => {
  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const { fullPath } = initialState!.resource;
  const newApplicationV2URL = `/groups${fullPath}/-/newapplicationv2`;
  const newApplicationV1URL = `/groups${fullPath}/-/newapplicationv1`;
  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={16} offset={4}>
          <Row>
            <Col span={18}>
              <h1>创建应用</h1>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button
                type="link"
                onClick={() => history.push(newApplicationV1URL)}
              >
                旧版入口
              </Button>
            </Col>
          </Row>
          <Divider />
          <span
            style={{
              fontSize: 18,
              fontWeight: 540,
              marginRight: 5,
              marginBottom: 15,
              marginTop: 15,
            }}
          >
            应用类型
          </span>
          <Row gutter={[30, 30]}>
            <Col key="从Git导入" span={8}>
              <Card
                style={{ height: 150 }}
                title="从Git导入"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/gitimport`)}
              >
                <div>从源代码开始构建并发布应用</div>
              </Card>
            </Col>
            <Col key="无构建发布" span={8}>
              <Card
                style={{ height: 150 }}
                title="无构建发布"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/nobuild`)}
              >
                <div>无需构建制品，直接通过模板部署应用</div>
              </Card>
            </Col>
            <Col key="镜像发布" span={8}>
              <Card
                style={{ height: 150 }}
                title="镜像发布"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/imagedeploy`)}
              >
                <div>部署现有制品镜像</div>
              </Card>
            </Col>
            <Col span={3} />
          </Row>
          <span
            style={{
              fontSize: 18,
              fontWeight: 540,
              marginRight: 5,
              marginBottom: 50,
              marginTop: 50,
            }}
          >
            快速开始
          </span>
          <Tooltip title="使用模板预置值快速创建应用">
            <QuestionCircleOutlined />
          </Tooltip>
          <Row gutter={[30, 30]}>
            <Col key="javaapp" span={8}>
              <Card
                style={{ height: 150 }}
                title="javaapp"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/importfromgit`)}
              >
                <div>javaapp template, used for java application. JDK version is jdk1.8.1_202</div>
              </Card>
            </Col>
            <Col key="tomcat" span={8}>
              <Card
                style={{ height: 150 }}
                title="tomcat"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/nobuild`)}
              >
                <div>template for tomcat application. JDK version is jdk1.8.0_202, Tomcat version is 8.5.42</div>
              </Card>
            </Col>
            <Col key="springboot" span={8}>
              <Card
                style={{ height: 150 }}
                title="springboot"
                hoverable
                onClick={() => history.push(`${newApplicationV2URL}/deployimage`)}
              >
                <div>template for springboot.</div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
