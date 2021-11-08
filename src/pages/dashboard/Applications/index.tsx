import {PageContainer} from '@ant-design/pro-layout';
import {Button, Col, Divider, Row} from 'antd';
import GroupTree from '@/components/GroupTree';
import {history} from 'umi';
import './index.less';
import {useIntl} from '@@/plugin-locale/localeExports';
import {useModel} from "@@/plugin-model/useModel";

export default () => {

  return (
    <Row id="groups">
      <Col span={4}/>
      <Col span={16}>
        <PageContainer header={{title: 'Applications'}} breadcrumbRender={false}>
          <Divider className={'group-divider'}/>
          <GroupTree groupID={0} tabPane={'Your groups'}/>
        </PageContainer>
      </Col>
      <Col span={4}/>
    </Row>
  );
};
