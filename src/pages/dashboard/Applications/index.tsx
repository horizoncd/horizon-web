import {
  useCallback,
  useEffect, useMemo, useState,
} from 'react';
import { BookOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { Location } from 'umi';
import { Card } from 'antd';
import { listApplications } from '@/services/applications/applications';
import '@/components/GroupTree/index.less';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination, PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import WithContainer from '../components/WithContainer';
import { setQuery } from '../utils';
import HorizonAutoCompleteHandler, { AutoCompleteOption } from '../../../components/FilterBox/HorizonAutoCompleteHandler';
import SearchBox from '../components/SearchBox';
import Expression from '@/components/FilterBox/Expression';

const DTreeWithPagination = ComponentWithPagination(DTree);

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

  const [filter, setFilter] = useState<string>();
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applications, setApplications] = useState<API.Application[]>([]);
  const [mode, setMode] = useState<string>('');
  const [defaultValue, setDefaultValue] = useState<Expression[]>([]);

  useEffect(() => {
    const {
      [QueryName]: qName = '',
      [QueryMode]: qMode = Mode.Own,
    } = location.query ?? {};

    setMode(qMode as string);
    setFilter(qName as string);
  }, [location.query]);

  useEffect(() => {
    const exprs: Expression[] = [];
    if (mode !== '') {
      exprs.push({ category: 'user', operator: '=', value: mode });
    }
    if (filter !== '') {
      exprs.push({ search: filter });
    }
    setDefaultValue([...exprs, {}]);
  }, [filter, mode]);

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
    const options: AutoCompleteOption[] = [
      {
        key: 'user',
        type: 'selection',
        values: [
          {
            operator: '=',
            possiableValues: ['all', 'own'],
          },
        ],
      },
    ];

    return new HorizonAutoCompleteHandler(options);
  }, []);

  const onSubmit = useCallback((result: Expression[]) => {
    setFilter('');
    result.forEach((expr) => {
      if (expr.search) {
        setFilter(expr.search);
      }
      if (expr.category && expr.value) {
        if (expr.category === 'user') {
          setMode(expr.value);
        }
      }
    });
  }, []);

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
    <>
      <SearchBox
        hKey="application"
        autoCompleteHandler={handler}
        defaultValue={defaultValue}
        onSubmmit={onSubmit}
      />
      <Card>
        {appList}
      </Card>
    </>
  );
}

export default WithContainer(PageWithInitialState(Applications));
