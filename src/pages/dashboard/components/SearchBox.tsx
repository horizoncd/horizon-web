/* eslint-disable react/require-default-props */
import {
  useCallback, useRef,
} from 'react';
import { DownOutlined } from '@ant-design/icons';
import hash from 'object-hash';
import {
  MenuProps, Dropdown, Space, Button,
} from 'antd';
import store from 'store2';
import { useHistory, useIntl } from 'umi';
import BaseAutoCompleteHandler from '@/components/FilterBox/BaseAutoCompleteHandler';
import { TagsFilter } from '@/components/FilterBox/TagFilter';
import Expression from '@/components/FilterBox/Expression';

function DropdownHistory(props: { sch?: Expression[][], onClickHistory?: (e: Expression[]) => void, showCollection?: boolean }) {
  const intl = useIntl();
  const { sch = [], onClickHistory = (() => { }), showCollection } = props;
  const history = useHistory();
  let items: MenuProps['items'] = [
    {
      label: intl.formatMessage({ id: 'pages.dashboard.filter.your.clusters' }),
      key: 'yourcluster',
    },
    {
      label: intl.formatMessage({ id: 'pages.dashboard.filter.your.applications' }),
      key: 'yourapp',
    },
    {
      label: intl.formatMessage({ id: 'pages.dashboard.filter.all.clusters' }),
      key: 'allcluster',
    },
    {
      label: intl.formatMessage({ id: 'pages.dashboard.filter.all.applications' }),
      key: 'allapp',
    },
    {
      type: 'divider',
    },
  ];

  if (showCollection) {
    items = [
      {
        label: intl.formatMessage({ id: 'pages.dashboard.filter.your.collections' }),
        key: 'collection',
      }, ...items,
    ];
  }

  sch.forEach((exprs, index) => {
    const expression = exprs.map(
      (e, i) => (i === exprs.length - 1 && e.search && e.search !== '' ? e.search : `${e.category} ${e.operator} ${e.value}`),
    );
    const item = expression.join(' ');
    items!.push({ label: item, key: `${index}` });
  });

  const onClick: MenuProps['onClick'] = ({ key }) => {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'collection':
        history.push(`${history.location.pathname}?isFavorite=true`);
        break;
      case 'yourcluster':
        history.push('/dashboard/clusters?mode=own');
        break;
      case 'allcluster':
        history.push('/dashboard/clusters?mode=all');
        break;
      case 'yourapp':
        history.push('/dashboard/applications?mode=own');
        break;
      case 'allapp':
        history.push('/dashboard/applications?mode=all');
        break;
      default:
        onClickHistory(sch[parseInt(key, 10)]);
    }
  };

  return (
    <Dropdown menu={{ items, onClick }}>
      <Button style={{ height: '37.784px' }}>
        <Space>
          {intl.formatMessage({ id: 'pages.dashboard.filter' })}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}

const SearchBox = (props: {
  hKey: string,
  autoCompleteHandler: BaseAutoCompleteHandler,
  defaultValue: Expression[],
  onInputChange?: ((exprs: Expression[]) => void),
  onSubmmit: ((exprs: Expression[]) => void),
  showCollection?: boolean,
}) => {
  const {
    hKey, autoCompleteHandler, defaultValue, onSubmmit, onInputChange, showCollection,
  } = props;

  const inputRef = useRef();

  const saveHistory = useCallback((result: Expression[]) => {
    const history = store.get(hKey) as Expression[][];
    if (history === null) {
      store.set(hKey, [result]);
    } else {
      history.push(result);
      let newHistory: Expression[][] = [result, ...history];
      const m: Record<string, null> = {};
      newHistory = newHistory.filter((item) => { const h = hash(item); if (h in m) { return false; } m[h] = null; return true; });
      if (newHistory.length > 5) {
        newHistory = newHistory.slice(0, 5);
      }
      store.set(hKey, newHistory);
    }
  }, [hKey]);

  return (
    <div style={{
      marginTop: '30px',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
    }}
    >
      <DropdownHistory
        sch={(store.get(hKey) ?? []) as Expression[][]}
        onClickHistory={(e) => { if (inputRef.current) inputRef.current.setQuery(e); }}
        showCollection={showCollection}
      />
      <div className="main-container" style={{ flexGrow: '1' }}>
        <TagsFilter
          onChange={onInputChange}
          ref={inputRef}
          autoCompleteHandler={autoCompleteHandler}
          defaultExprs={defaultValue}
          onSubmit={(exprs) => { saveHistory(exprs); onSubmmit(exprs); }}
        />
      </div>
    </div>
  );
};

export default SearchBox;
