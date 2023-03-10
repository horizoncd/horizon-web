/* eslint-disable react/no-array-index-key */
/* eslint-disable react/require-default-props */
import './styles.css';
import React, {
  KeyboardEventHandler, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,
} from 'react';
import { Portal } from 'react-portal';
import { CloseCircleOutlined } from '@ant-design/icons/lib';
import styled from 'styled-components';
import FilterQueryParser from './FilterQueryParser';
import Tag from './tag';
import Suggestions from './suggestions';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';
import GridDataAutoCompleteHandler, { Option } from './GridDataAutoCompleteHandler';
import Expression from './Expression';
import { HintInfo } from './models/ExtendedCodeMirror';

const InputBox = styled.div`
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    line-height: 1.8; 
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

export interface TagsFilterProps {
  name?: string,
  placeHolder?: string,
  onBlur?: any,
  disabled?: boolean,
  data?: any,
  options?: Option[],
  autoCompleteHandler?: BaseAutoCompleteHandler,
  defaultExprs?: Expression[],
  onClear?: () => void,
  onChange?: (items: Expression[]) => void,
  onSubmit: (items: Expression[]) => void,
}

export const TagsFilter = React.forwardRef((props: TagsFilterProps, ref) => {
  const {
    name,
    placeHolder,
    onBlur,
    data,
    options,
    disabled,
    defaultExprs,
    onSubmit: onSubmitInner,
    onChange,
    onClear,
  } = props;

  const onSubmit = useCallback((exprs: Expression[]) => {
    onSubmitInner(exprs.filter((o) => ((o.category && o.operator && o.value) || o.search)));
  }, [onSubmitInner]);
  const [autoCompleteHandler, setAutoCompleteHandler] = useState<BaseAutoCompleteHandler>();
  const [selected, setSelected] = useState<Expression[]>([]);
  const [expand, setExpand] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [mIndex, setMIndex] = useState<number>(-1);
  const [mType, setMType] = useState<'category' | 'operator' | 'value' | undefined>(undefined);
  const inputRef = useRef();
  const sgRef = useRef();

  useEffect(() => {
    setAutoCompleteHandler(props.autoCompleteHandler ?? new GridDataAutoCompleteHandler(data, options));
  }, [data, options, props.autoCompleteHandler]);

  const setSearch = useCallback((exprs: Expression[], callback?: (e: Expression[]) => void) => {
    const rest = exprs.filter((o) => o && (o.category || (o.search && o.search !== '')));
    const last = rest.splice(rest.length - 1, 1)[0];
    if (last) {
      if (last.search && last.search !== '') {
        setQuery(last.search);
        setSelected([...rest]);
      } else {
        setQuery('');
        setSelected([...rest, last]);
      }
      if (callback) {
        callback([...rest, last]);
      }
    }
  }, [setQuery, setSelected]);

  useEffect(() => {
    if (onChange) {
      onChange(selected);
    }
  }, [onChange, selected]);

  useEffect(() => {
    if (defaultExprs && defaultExprs.length > 0) {
      setSearch(defaultExprs);
    }
  }, [defaultExprs, setSearch]);

  const parser = useMemo(() => {
    const p = new FilterQueryParser();
    p.setAutoCompleteHandler(autoCompleteHandler);
    return p;
  }, [autoCompleteHandler]);

  useImperativeHandle(ref, () => ({
    setAutoCompleteHandler: (handler: BaseAutoCompleteHandler) => { setAutoCompleteHandler(handler); },
    setQuery: (e: Expression[]) => {
      if (e.length > 0) {
        setSearch(e, onSubmit);
      }
    },
    setExpression: (exprs: Expression[]) => { setSelected(exprs); },
  }), [setSearch, onSubmit]);

  const clearAll = () => {
    if (inputRef.current) { inputRef.current.value = ''; }
    setQuery('');
    setMIndex(-1);
    setExpand(false);
    setSelected([]);
    if (onClear) {
      onClear();
    }
  };

  const handleOnKeyDown: KeyboardEventHandler = useCallback((e) => {
    e.stopPropagation();
    const { key } = e;
    const text: string = e.target.value;

    if (key === 'Enter') {
      e.preventDefault();
      const result : Expression[] = [...selected];
      if (query) {
        result.push({ search: query });
      }
      onSubmit(result);
      return;
    }

    if (!text && key === 'Backspace') {
      if (selected.length > 0) {
        const last = selected[selected.length - 1];
        if (last.value) {
          last.value = undefined;
          setSelected([...selected.slice(0, selected.length - 1), last]);
        } else if (last.operator) {
          last.operator = undefined;
          setSelected([...selected.slice(0, selected.length - 1), last]);
        } else {
          setSelected([...selected.slice(0, selected.length - 1)]);
        }
      }
    }
  }, [query, onSubmit, selected]);

  const onTagBlur = () => {
    setMIndex(-1);
  };

  const getSuggestions = useCallback((arr: Expression[], q?: string) => {
    if (!autoCompleteHandler) {
      return [];
    }
    const result = arr.flatMap((expr) => {
      let res = `${expr.category} `;
      if (expr.operator) {
        res += `${expr.operator} `;
      }
      if (expr.value) {
        res += `${expr.value} `;
      }
      return res;
    });

    if (q) {
      result.push(q);
    }
    return parser.getSuggestions(result.join(' '));
  }, [autoCompleteHandler, parser]);

  const onItemClickToChange = useCallback((type: 'category' | 'operator' | 'value', index: number) => {
    setMIndex(index);
    setMType(type);
    setExpand(true);
  }, []);

  const divID = useMemo(() => `portal-${Math.random()}`, []);

  useEffect(() => {
    let sgItems: HintInfo[] = [];
    if (mIndex < 0) {
      sgItems = getSuggestions(selected, query);
    } else {
      const selectedWithModifying = [...selected];
      const expr = selectedWithModifying.splice(mIndex, 1)[0];
      if (mType === 'category') {
        sgItems = getSuggestions(selectedWithModifying);
      } if (mType === 'operator') {
        sgItems = getSuggestions([...selectedWithModifying, { ...expr, operator: undefined, value: undefined }]);
      } else if (mType === 'value') {
        sgItems = getSuggestions([...selectedWithModifying, { ...expr, value: undefined }]);
      }
    }
    if (sgRef.current) {
      sgRef.current.setSgOptions(sgItems.map((o) => ({ key: o.type, name: o.value as string })));
    }
  }, [getSuggestions, mIndex, mType, query, selected, autoCompleteHandler]);

  return (
    <div>
      <InputBox
        aria-labelledby={name}
        key="input"
        onKeyDown={handleOnKeyDown}
        onBlur={() => {
          setMIndex(-1);
          setExpand(false);
          setSelected(selected.filter((o) => o.category && o.operator && o.value));
          if (onBlur) onBlur();
        }}
      >
        {
          selected.map((expr, i) => (
            <>
              <Tag
                key={`category-${i}`}
                onClick={() => { onItemClickToChange('category', i); }}
                text={expr.category!}
                onBlur={onTagBlur}
              />
              {
                  expr.operator && (
                    <Tag
                      key={`operator-${i}-op`}
                      text={expr.operator}
                      onClick={() => { onItemClickToChange('operator', i); }}
                      onBlur={onTagBlur}
                    />
                  )
                }
              {
                  expr.value && (
                    <Tag
                      key={`operator-${i}-value`}
                      text={expr.value}
                      remove={() => { selected.splice(i, 1); setExpand(false); setSelected([...selected]); }}
                      onClick={() => { onItemClickToChange('value', i); }}
                      onBlur={onTagBlur}
                    />
                  )
                }
            </>
          ))
        }
        <input
          value={query}
          style={{ flex: '1' }}
          ref={inputRef}
          autoComplete="off"
          className="rti--input"
          type="text"
          name={name}
          placeholder={selected.length === 0 ? placeHolder : ''}
          onClick={() => setExpand(!expand)}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          disabled={disabled}
        />
        <Portal node={document && document.getElementById(divID)}>
          <Suggestions
            expand={expand}
            ref={sgRef}
            id="sug"
            query={query}
            options={[]}
            onItemClick={(item) => {
              if (mIndex < 0) {
                if (item.key === 'category') {
                  setSelected([...selected, { category: item.name }]);
                } else if (item.key === 'operator') {
                  setSelected([...selected.slice(0, selected.length - 1), { ...selected[selected.length - 1], operator: item.name }]);
                } else if (item.key === 'value') {
                  setSelected([...selected.slice(0, selected.length - 1), { ...selected[selected.length - 1], value: item.name }]);
                }
              } else if (item.key === 'category') {
                selected[mIndex].category = item.name;
                selected[mIndex].operator = undefined;
                selected[mIndex].value = undefined;
                setMType('operator');
                setSelected([...selected]);
              } else if (item.key === 'operator') {
                selected[mIndex].operator = item.name;
                setMType('value');
                setSelected([...selected]);
              } else if (item.key === 'value') {
                selected[mIndex].value = item.name;
                setSelected([...selected]);
                setMType(undefined);
                setMIndex(-1);
                setExpand(false);
              }
            }}
          />
        </Portal>
        <CloseButton onClick={clearAll} />
      </InputBox>
      <div id={divID} />
    </div>
  );
});

TagsFilter.defaultProps = {
  name: '',
  placeHolder: '',
  onBlur: undefined,
  disabled: undefined,
};
