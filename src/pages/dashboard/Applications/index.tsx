import { useMemo, useState } from 'react';
import { BookOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { Input, Tabs } from 'antd';
import { Location, useIntl } from 'umi';
import { listApplications } from '@/services/applications/applications';
import '@/components/GroupTree/index.less';
import type { API } from '@/services/typings';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination, PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import withTrim from '@/components/WithTrim';
import TitleWithCount from '../components/TitleWithCount';
import WithContainer from '../components/WithContainer';
import { setQuery } from '../utils';

const Search = withTrim(Input.Search);
const DTreeWithPagination = ComponentWithPagination(DTree);
const { TabPane } = Tabs;

enum Mode {
  Own = 'own', All = 'all',
}

const QueryName = 'name';
const QueryMode = 'mode';

interface MyApplicationsProps
  extends PageWithInitialStateProps {
  location: Location
}

function Applications(props: MyApplicationsProps) {
  const { initialState, location } = props;
  const { [QueryName]: qName = '', [QueryMode]: qMode = Mode.Own } = location.query ?? {};

  const intl = useIntl();
  const [filter, setFilter] = useState(qName as string);
  const [total, setTotal] = useState(0);
  const [showTotal, setShowTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applications, setApplications] = useState<API.Application[]>([]);
  const [mode, setMode] = useState(qMode as string);

  // search your applications
  useRequest(() => listApplications({
    userID: mode === Mode.Own
      ? initialState?.currentUser?.id
      : undefined,
    filter,
    pageSize,
    pageNumber,
  }), {
    refreshDeps: [filter, pageNumber, pageSize, mode],
    debounceInterval: 200,
    onSuccess: (data) => {
      const { items, total: t } = data!;
      if (mode === Mode.Own) setShowTotal(t);
      setTotal(t);
      setApplications(items);
      setQuery({
        [QueryMode]: mode,
        [QueryName]: filter,
      });
    },
  });

  const applicationQueryInput = useMemo(() => (
    <Search
      placeholder={intl.formatMessage({ id: 'pages.common.search' })}
      onChange={(e) => { setFilter(e.target.value); }}
      value={filter}
    />
  ), [filter, intl]);

  const onPageChange = (page: number, pz: number) => {
    setPageNumber(page);
    setPageSize(pz);
  };

  const appList = useMemo(() => (
    <DTreeWithPagination
      pageSize={pageSize}
      page={pageNumber}
      total={total}
      onPageChange={onPageChange}
      items={
                    applications.map((item) => ({
                      icon: <BookOutlined />,
                      ...item,
                    }))
                }
    />
  ), [applications, pageNumber, pageSize, total]);

  return (
    <Tabs
      size="large"
      tabBarExtraContent={applicationQueryInput}
      animated={false}
      defaultActiveKey={mode}
      onChange={(key) => { setMode(key as Mode); }}
      style={{ marginTop: '15px' }}
    >
      <TabPane
        tab={(
          <TitleWithCount
            name={intl.formatMessage({ id: 'pages.dashboard.title.your.applications' })}
            count={showTotal}
          />
        )}
        key={Mode.Own}
      >
        {appList}
      </TabPane>
      <TabPane
        tab={intl.formatMessage({ id: 'pages.dashboard.title.all.applications' })}
        key={Mode.All}
      >
        {appList}
      </TabPane>
    </Tabs>
  );
}

export default WithContainer(PageWithInitialState(Applications));
