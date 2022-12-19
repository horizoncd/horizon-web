import './styles.css';
import {
  forwardRef, KeyboardEventHandler, PropsWithChildren, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { Portal } from 'react-portal';
import { CloseCircleOutlined } from '@ant-design/icons/lib';
import styled from 'styled-components';
import {
  Item, SelectedToken, SuggestionProps, Token,
} from './types';
import Tag from './tag';
import Suggestions from './suggestions';

const InputBox = styled.div`
    align-items: center;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    line-height: 1.4;
    padding: 3px 10px 3px 10px;

  :focus-within {
      border-color: #3182ce;
      box-shadow: #3182ce 0px 0px 0px 1px;
  }

  * {

      /* box-sizing: border-box; */
      /* transition: all 0.2s ease; */
  }
`;

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  <div
    onClick={onClick}
    style={
      {
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
      }
    }
  >
    <CloseCircleOutlined />
  </div>
);

const SuggestionWithRef = forwardRef((props: PropsWithChildren<Omit<SuggestionProps, 'onClick'>>, ref) => {
  const [callback, setCallback] = useState<{ onClick:(item: Item) => void }>({ onClick: () => { } });
  const { onClick } = callback;

  useImperativeHandle(ref, () => ({
    setCallback,
  }));

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Suggestions {...props} onClick={onClick} />;
});

enum Pattern {
  Key = 0, Operator = 1, Value = 2,
}

export interface TagsInputProps {
  name?: string;
  placeHolder?: string;
  avaliableTokens: Token[],
  values?: { type: string, value: { operator: string, data: string } }[]
  onBlur?: any;
  disabled?: boolean;
  onClear: () => void;
  onSubmit: (items: any[]) => void;
}

export const TagsInput = ({
  name,
  placeHolder,
  avaliableTokens,
  values = [],
  onBlur,
  disabled,
  onClear,
  onSubmit,
}: TagsInputProps) => {
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [expand, setExpand] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [sgConfigs, setSgConfigs] = useState<Item[]>([]);
  const [currentAddition, setCurrentAddition] = useState(Pattern.Key);
  const [isModifying, setIsModifying] = useState(false);
  const sgRef = useRef();
  const input = useRef();

  useEffect(() => {
    const selected: SelectedToken[] = [];
    values.forEach((item) => {
      if (typeof item === 'string') {
        setQuery(item);
        return;
      }
      const tokens = avaliableTokens.filter((t) => t.type === item.type);
      if (tokens.length === 1) {
        const operators = tokens[0].operators.filter((o) => o.value === item.value.operator);
        const options = tokens[0].options.filter((o) => o.value === item.value.data);
        if (operators.length > 0 && options.length > 0) {
          selected.push({
            token: tokens[0],
            operator: operators[0],
            option: options[0],
          });
        }
      }
    });
    setSelectedTokens(selected);
  }, [values, avaliableTokens]);

  const clearAll = () => {
    input.current.value = '';
    setQuery('');
    setSelectedTokens([]);
    setCurrentAddition(Pattern.Key);
    setIsModifying(false);
    setExpand(false);
    onClear();
  };

  const setSgOnClick = (callback: (item: Item) => void) => {
    if (sgRef.current) {
      sgRef.current.setCallback({ onClick: callback });
    }
  };

  const addTokenForKey = useCallback(() => {
    const sgItems = avaliableTokens.map((t) => ({ key: t.type, name: t.title }));
    const callback = (item: Item) => {
      const tokens = avaliableTokens.filter((v) => v.type === item.key);
      if (tokens.length !== 1) {
        return;
      }
      setSelectedTokens([...selectedTokens, { token: tokens[0] } as SelectedToken]);
      setCurrentAddition(Pattern.Operator);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
  }, [selectedTokens, avaliableTokens]);

  const addTokenForOperator = useCallback(() => {
    const lastSelectedToken = selectedTokens[selectedTokens.length - 1];
    const sgItems = lastSelectedToken.token.operators.map((o) => ({ key: o.value, name: o.description }));
    const callback = (item: Item) => {
      const operators = lastSelectedToken.token.operators.filter((o) => o.value === item.key);
      if (operators.length !== 1) {
        return;
      }

      setSelectedTokens(
        [...selectedTokens.slice(0, -1), {
          token: lastSelectedToken.token,
          operator: operators[0],
        }],
      );
      setCurrentAddition(Pattern.Value);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
  }, [selectedTokens]);

  const addTokenForOption = useCallback(() => {
    const lastSelectedToken = selectedTokens[selectedTokens.length - 1];
    const sgItems = lastSelectedToken.token.options.map((o) => ({ key: o.value, name: o.title }));
    const callback = (item: Item) => {
      const options = lastSelectedToken.token.options.filter((o) => o.value === item.key);
      if (options.length !== 1) {
        return;
      }

      setSelectedTokens(
        [...selectedTokens.slice(0, -1), {
          token: lastSelectedToken.token,
          operator: lastSelectedToken.operator,
          option: options[0],
        }],
      );
      setCurrentAddition(Pattern.Key);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
  }, [selectedTokens]);

  const addToken = useCallback(() => {
    if (currentAddition === Pattern.Key) {
      addTokenForKey();
    } else if (currentAddition === Pattern.Operator) {
      addTokenForOperator();
    } else {
      addTokenForOption();
    }
  }, [addTokenForKey, addTokenForOperator, addTokenForOption, currentAddition]);

  useEffect(() => {
    if (expand && !isModifying) {
      addToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expand, currentAddition]);

  const handleOnKeyDown: KeyboardEventHandler = useCallback((e) => {
    e.stopPropagation();
    const { key } = e;
    const text: string = e.target.value;

    if (key === 'Enter') {
      e.preventDefault();
      const items: any[] = [];
      selectedTokens.forEach((t) => items.push({
        type: t.token.type,
        value: {
          operator: t.operator?.value,
          data: t.option?.value,
        },
      }));

      if (query) {
        items.push(query);
      }
      onSubmit(items);
      return;
    }

    if (!text && selectedTokens.length && key === 'Backspace') {
      if (currentAddition === Pattern.Operator) {
        setSelectedTokens([...selectedTokens.slice(0, -1)]);
      } else if (currentAddition === Pattern.Value) {
        const t = selectedTokens[selectedTokens.length - 1];
        setSelectedTokens([...selectedTokens.slice(0, -1), { token: t.token }]);
      } else {
        const t = selectedTokens[selectedTokens.length - 1];
        setSelectedTokens([...selectedTokens.slice(0, -1), { token: t.token, operator: t.operator }]);
      }
      setCurrentAddition(((currentAddition as number) + 2) % 3);
    }
  }, [currentAddition, selectedTokens, query, onSubmit]);

  const onTokenKeyClick = useCallback((token: SelectedToken, i: number) => {
    const tokens = avaliableTokens.filter((v) => (
      v.operators.filter((o) => !token.operator || o.value === token.operator.value).length > 0
    )).filter((v) => (
      v.options.filter((o) => !token.option || o.value === token.option.value).length > 0
    ));
    const sgItems = tokens.map((t) => ({ key: t.type, name: t.title }));
    const callback = (item: Item) => {
      const selected = tokens.filter((v) => v.type === item.key);
      if (selected.length !== 1) {
        return;
      }
      const t = selectedTokens;
      t[i] = {
        ...token,
        token: selected[0],
      };
      setSelectedTokens(t);
      setExpand(false);
      setIsModifying(false);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
    setIsModifying(true);
  }, [selectedTokens, avaliableTokens]);

  const onTokenOperatorClick = useCallback((token: SelectedToken, i: number) => {
    const sgItems = token.token.operators.map((o) => ({ key: o.value, name: o.description }));
    const callback = (item: Item) => {
      const operators = token.token.operators.filter((o) => o.value === item.key);
      if (operators.length !== 1) {
        return;
      }

      const t = selectedTokens;
      t[i] = {
        ...token,
        operator: operators[0],
      };
      setSelectedTokens(t);
      setExpand(false);
      setIsModifying(false);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
    setIsModifying(true);
  }, [selectedTokens]);

  const onTokenOptionClick = useCallback((token: SelectedToken, i: number) => {
    const sgItems = token.token.options.map((o) => ({ key: o.value, name: o.title }));
    const callback = (item: Item) => {
      const options = token.token.options.filter((o) => o.value === item.key);
      if (options.length !== 1) {
        return;
      }

      const t = selectedTokens;
      t[i] = {
        ...token,
        option: options[0],
      };

      setSelectedTokens(t);
      setExpand(false);
      setIsModifying(false);
    };

    setSgConfigs(sgItems);
    setSgOnClick(callback);
    setExpand(true);
    setIsModifying(true);
  }, [selectedTokens]);

  const onTagBlur = () => {
    setIsModifying(false);
  };

  return (
    <>
      <InputBox
        style={{ display: 'flex' }}
        aria-labelledby={name}
        onBlur={() => { setIsModifying(false); setExpand(false); if (onBlur) onBlur(); }}
      >
        {
          selectedTokens.map((t, i) => (
            <>
              <Tag
                key={t.token.type}
                onClick={() => onTokenKeyClick(t, i)}
                text={t.token.title}
                onBlur={onTagBlur}
              />
              {t.operator && (
                <Tag
                  key={`${t.token.type}${t.operator.value}`}
                  text={t.operator.description}
                  onClick={() => onTokenOperatorClick(t, i)}
                  onBlur={onTagBlur}
                />
              )}
              {t.option && (
                <>
                  <Tag
                    key={`${t.token.type}${t.option.value}`}
                    text={t.option.title}
                    remove={() => { selectedTokens.splice(i, 1); setExpand(false); setSelectedTokens([...selectedTokens]); }}
                    onClick={() => onTokenOptionClick(t, i)}
                    onBlur={onTagBlur}
                  />
                  <div style={{ width: '3px', height: '100%' }} />
                </>
              )}
            </>
          ))
        }
        <input
          defaultValue={query}
          style={{ flex: '1' }}
          ref={input}
          autoComplete="off"
          className="rti--input"
          type="text"
          name={name}
          placeholder={selectedTokens.length === 0 ? placeHolder : ''}
          onClick={() => setExpand(!expand)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleOnKeyDown}
          disabled={disabled}
        />
        <Portal node={document && document.getElementById('portal')}>
          <SuggestionWithRef expand={expand} id="sug" query={query} options={sgConfigs} ref={sgRef} />
        </Portal>
        <CloseButton onClick={clearAll} />
      </InputBox>
      <div id="portal" />
    </>
  );
};

TagsInput.defaultProps = {
  name: '',
  placeHolder: '',
  onBlur: undefined,
  disabled: undefined,
  values: {},
};
