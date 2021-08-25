import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Row, Button } from 'antd';
import GroupTree from '@/components/GroupTree'
import {history} from 'umi';
import './groups.less';
import {stringify} from "querystring";

export default () => {
  const newGroup = '/groups/new';

  const header = () => {
    return (<Button type="primary" onClick={() => history.push({
      pathname: newGroup,
      search: stringify({
        parent_id: 123,
      }),
    })} style={{backgroundColor: '#1f75cb'}}>New group</Button>)
  }

  return (
    <Row id="groups">
      <Col span={4} />
      <Col span={16}>
        <PageContainer header={{title: 'Groups', extra: header()}} breadcrumbRender={false}>
          <Divider className={'group-divider'} />
          <GroupTree tabPane={'Your groups'}/>
        </PageContainer>
      </Col>
      <Col span={4} />
    </Row>
  );
};
