import {
  useCallback,
  useEffect, useMemo, useState,
} from 'react';
import { BookOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { Location, useIntl } from 'umi';
import { Tabs } from 'antd';
import TabPane from 'antd/lib/tabs/TabPane';
import { listApplications } from '@/services/applications/applications';
import '@/components/GroupTree/index.less';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination, PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import { WithContainer, SearchBox } from '../components';
import { setQuery } from '../utils';
import HorizonAutoCompleteHandler, { AutoCompleteOption } from '@/components/FilterBox/HorizonAutoCompleteHandler';
import Expression from '@/components/FilterBox/Expression';

const DTreeWithPagination = ComponentWithPagination(DTree);

const KeySearchUser = 'User';

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

  const intl = useIntl();
  const [filter, setFilter] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applications, setApplications] = useState<API.Application[]>([]);
  const [mode, setMode] = useState<string>('');
  const [defaultValue, setDefaultValue] = useState<Expression[]>([]);

  const setFilterTrim = useCallback((value: string) => {
    setFilter(value.trim());
  }, []);

  useEffect(() => {
    const {
      [QueryName]: qName = '',
      [QueryMode]: qMode = Mode.Own,
    } = location.query ?? {};

    setMode(qMode as string);
    setFilterTrim(qName as string);
  }, [location.query, setFilterTrim]);

  useEffect(() => {
    const exprs: Expression[] = [];
    if (filter !== '') {
      exprs.push({ search: filter });
    }
    setDefaultValue([...exprs, {}]);
  }, [filter]);

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
      setTotal(t);
      setApplications(items);
      setQuery({
        [QueryMode]: mode,
        [QueryName]: filter,
      });
    },
  });

  const onPageChange = (page: number, pz: number) => {
    setPageNumber(page);
    setPageSize(pz);
  };

  const handler = useMemo(() => {
    const options: AutoCompleteOption[] = [];
    return new HorizonAutoCompleteHandler(options);
  }, []);

  const onSubmit = useCallback((result: Expression[]) => {
    setFilter('');
    result.forEach((expr) => {
      if (expr.search) {
        setFilterTrim(expr.search);
      }
      if (expr.category && expr.value) {
        if (expr.category === KeySearchUser) {
          setMode(expr.value);
        }
      }
    });
  }, [setFilterTrim]);

  const searchBox = useMemo(() => (
    <SearchBox
      historyKey="application"
      autoCompleteHandler={handler}
      defaultValue={defaultValue}
      onSubmit={onSubmit}
      onClear={() => { setFilter(''); }}
    />
  ), [defaultValue, handler, onSubmit]);

  const appList = useMemo(() => (
    <DTreeWithPagination
      pageSize={pageSize}
      page={pageNumber}
      total={total}
      onPageChange={onPageChange}
      items={applications.map((item) => ({
        icon: <BookOutlined />,
        ...item,
      }))}
    />
  ), [applications, pageNumber, pageSize, total]);

  return (
    <>
      <Tabs
        size="large"
        animated={false}
        defaultActiveKey={mode}
        onChange={(key) => { setMode(key as Mode); }}
        style={{ marginTop: '15px' }}
      >
        <TabPane
          tab={intl.formatMessage({ id: 'pages.dashboard.title.all.applications' })}
          key={Mode.All}
        />
        <TabPane
          tab={intl.formatMessage({ id: 'pages.dashboard.title.your.applications' })}
          key={Mode.Own}
        />
      </Tabs>
      {searchBox}
      {appList}
    </>
  );
}

export default WithContainer(PageWithInitialState(Applications));
