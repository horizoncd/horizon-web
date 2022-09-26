import { Button, Table, Tabs } from 'antd';
import { history, useRequest } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RBAC from '@/rbac';
import { getTemplates } from '@/services/templates/templates';
import { TemplateTab, TemplateTableColumns, TemplateTableLocale } from '..';
import { API } from '@/services/typings';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';

const { TabPane } = Tabs;

interface GroupTemplateTableProps {
  groupID: number
}

const GroupTemplateTable: React.FC<GroupTemplateTableProps> = (props: GroupTemplateTableProps) => {
  const { groupID } = props;
  const { data: templates } = useRequest(() => getTemplates(groupID, true), {});

  return (
    <Table
      rowKey="id"
      columns={TemplateTableColumns}
      dataSource={templates}
      locale={TemplateTableLocale}
      pagination={{
        position: ['bottomCenter'],
        hideOnSinglePage: true,
        total: templates?.length,
        pageSize: 10,
      }}
    />
  );
};

function TemplatesInGroup(props: { initialState: API.InitialState }) {
  const { initialState: { resource: { fullName, id } } } = props;

  const queryInput = (
    <Button
      type="primary"
      style={{ marginBottom: 10, float: 'right', marginRight: 5 }}
      onClick={() => {
        history.push(`/groups/${fullName}/-/newtemplate`);
      }}
    >
      创建templates
    </Button>
  );

  return (
    <PageWithBreadcrumb>
      <TemplateTab createButton={RBAC.Permissions.createTemplate.allowed && queryInput}>
        <TabPane tab="Templates">
          <GroupTemplateTable key="1" groupID={id} />
        </TabPane>
      </TemplateTab>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(TemplatesInGroup);
