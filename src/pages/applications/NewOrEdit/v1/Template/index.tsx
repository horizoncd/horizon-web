import {
  Card, Col, Row, Radio, Tabs,
} from 'antd';
import { useRequest } from 'umi';
import { getRootTemplates, getTemplates } from '@/services/templates/templates';
import './index.less';
import type { API } from '@/services/typings';
import NoData from '@/components/NoData';
import { PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import { ResourceType } from '@/const';

const { TabPane } = Tabs;

const Cards = (props: { data: API.Template[], template: API.Template, resetTemplate: (t: API.Template) => void }) => {
  const { template, data, resetTemplate } = props;
  const isClicked = (item: API.Template) => item.name === template?.name;

  return (
    <Row gutter={[30, 30]}>
      {data?.map((item: API.Template) => (
        <Col key={item.name} span={8}>
          <Card
            hoverable
            onClick={() => resetTemplate(item)}
            className={`card ${isClicked(item) ? 'card-after-clicked' : 'card-before-clicked'}`}
          >
            <div className="awsui-cards-card-header">
              <span className="awsui-cards-card-header-inner">{item.name}</span>
              <span className="radio">
                <Radio checked={isClicked(item)} />
              </span>
            </div>
            <div>{item.description}</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

interface TemplateProps {
  template: API.Template,
  apiVersion: string,
  resetTemplate: (o: API.Template) => void
}

interface GroupTemplateProps extends TemplateProps {
  groupID: number
}

const AllTemplateCards = (props: TemplateProps) => {
  const { template, resetTemplate, apiVersion } = props;
  const { data } = useRequest(() => getRootTemplates(false, false, apiVersion));

  if (!data) {
    return null;
  }

  return (
    <Cards
      data={data}
      template={template}
      resetTemplate={resetTemplate}
    />
  );
};

const GroupCards = (props: GroupTemplateProps) => {
  const {
    groupID, template, resetTemplate, apiVersion,
  } = props;
  const { data } = useRequest(() => getTemplates(groupID, false, true, apiVersion));
  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return <NoData titleID="pages.common.template" descID="pages.noData.templates.hint" />;
  }

  return (
    <Cards
      data={data}
      template={template}
      resetTemplate={resetTemplate}
    />
  );
};

function TemplateCards(props: TemplateProps & PageWithInitialStateProps) {
  const { initialState: { resource: { id, type, parentID } } } = props;
  const { template, resetTemplate, apiVersion } = props;

  const groupID = type === ResourceType.APPLICATION
    ? parentID
    : id;

  return (
    <Tabs>
      <TabPane tab="Public Templates" key={1}>
        <AllTemplateCards
          template={template}
          resetTemplate={resetTemplate}
          apiVersion={apiVersion}
        />
      </TabPane>
      <TabPane tab="Group Templates" key={2}>
        <GroupCards
          template={template}
          resetTemplate={resetTemplate}
          groupID={groupID}
          apiVersion={apiVersion}
        />
      </TabPane>
    </Tabs>
  );
}

const TempalteCardsWithInitialState = PageWithInitialState(TemplateCards);

export default TempalteCardsWithInitialState;
