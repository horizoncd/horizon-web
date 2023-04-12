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

interface HistoryItem {
  label: string;
  key: string;
}

function DropdownHistory(props: { searchHistory?: Expression[][], onClickHistory?: (e: Expression[]) => void }) {
  const intl = useIntl();
  const { searchHistory = [], onClickHistory = (() => { }) } = props;
  const history = useHistory();
  const items: HistoryItem[] = [];

  searchHistory.forEach((exprs, index) => {
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
      case 'yourapp':
        history.push('/dashboard/applications?mode=own');
        break;
      case 'allapp':
        history.push('/dashboard/applications?mode=all');
        break;
      default:
        onClickHistory(searchHistory[parseInt(key, 10)]);
    }
  };

  return (
    <Dropdown menu={{ items, onClick }}>
      <Button style={{ height: '37.784px' }}>
        <Space>
          {intl.formatMessage({ id: 'pages.dashboard.history' })}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}

const SearchBox = (props: {
  historyKey: string,
  autoCompleteHandler: BaseAutoCompleteHandler,
  defaultValue: Expression[],
  onInputChange?: ((exprs: Expression[]) => void),
  onSubmit: ((exprs: Expression[]) => void),
  onClear: () => void,
}) => {
  const {
    historyKey, autoCompleteHandler, defaultValue, onSubmit, onInputChange, onClear,
  } = props;

  const inputRef = useRef();

  const saveHistory = useCallback((result: Expression[]) => {
    // eslint-disable-next-line no-param-reassign
    result = result.filter((o) => (o.category && o.operator && o.value) || o.search);
    const history = store.get(historyKey) as Expression[][];
    if (history === null) {
      store.set(historyKey, [result]);
    } else {
      if (result.length === 0) {
        return;
      }
      history.push(result);
      let newHistory: Expression[][] = [result, ...history];
      const m: Record<string, null> = {};
      newHistory = newHistory.filter((item) => {
        const h = hash(item);
        if (h in m) {
          return false;
        } m[h] = null;
        return true;
      });
      if (newHistory.length > 5) {
        newHistory = newHistory.slice(0, 5);
      }
      store.set(historyKey, newHistory);
    }
  }, [historyKey]);

  return (
    <div style={{
      marginTop: '10px',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
    }}
    >
      <DropdownHistory
        searchHistory={(store.get(historyKey) ?? []) as Expression[][]}
        onClickHistory={(e) => { if (inputRef.current) inputRef.current.setQuery(e); }}
      />
      <div className="main-container" style={{ flexGrow: '1' }}>
        <TagsFilter
          onChange={onInputChange}
          ref={inputRef}
          autoCompleteHandler={autoCompleteHandler}
          defaultExprs={defaultValue}
          onClear={onClear}
          onSubmit={(exprs) => { saveHistory(exprs); onSubmit(exprs); }}
        />
      </div>
    </div>
  );
};

export default SearchBox;
