import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Divider, Row } from 'antd';
import GroupTree from '@/components/GroupTree'
import { history } from 'umi';
import './index.less';

export default () => {
  const newGroup = '/groups/new';

  const header = () => {
    return (<Button type="primary" onClick={() => history.push({
      pathname: newGroup,
    })} style={{ backgroundColor: '#1f75cb' }}>New group</Button>)
  }

  return (
    <Row id="groups">
      <Col span={4}/>
      <Col span={16}>
        <PageContainer header={{ title: 'Groups', extra: header() }} breadcrumbRender={false}>
          <Divider className={'group-divider'}/>
          <GroupTree parentId={0} tabPane={'Your groups'}/>
        </PageContainer>
      </Col>
      <Col span={4}/>
    </Row>
  );
};
