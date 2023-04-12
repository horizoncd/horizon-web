/* eslint-disable react/destructuring-assignment */
import React, { PropsWithChildren, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import QueryBoldSpan from '../Widget/QueryBoldSpan';
import { SuggestionProps } from './types';

const FloatBox = styled.div`
  display: inline-block;
  position: absolute;
  background-color: white;
  border: 1px solid lightgray;
  border-radius: 5px;
  margin-top: 5px;
  width: 90%;
  z-index: 1;
`;

const SuggestionList = styled.ul`
margin-top: 6px;
margin-bottom: 6px;
width : 100%;
padding-left: 0px;
`;

const SuggestionItem = styled.li`
  width: 100%;
  padding-left: 20px;
  :hover {
    background-color: lightgrey;
  }
`;

const Suggestions = React.forwardRef((props: PropsWithChildren<SuggestionProps>, ref) => {
  const { query = '', expand = true, options: sgOptionsProps } = props;
  const [sgOptions, setSgOptions] = useState(sgOptionsProps);

  useImperativeHandle(ref, () => ({
    setSgOptions: (options: any) => setSgOptions(options),
  }), [setSgOptions]);

  const options = sgOptions.map((item, index) => {
    const key = `${item.key}-${item.name}`;
    const classNames: string[] = [];

    if (item.disabled) {
      classNames.push('is-disabled');
    }

    return (
      <SuggestionItem
        key={key}
        // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
        role="option"
        className={classNames.join(' ')}
        aria-disabled={Boolean(item.disabled)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => props.onItemClick(item, index)}
      >
        {item.prefix
          ? (
            <span>
              {item.prefix}
              {' '}
            </span>
          )
          : null}
        <QueryBoldSpan query={query}>{item.name ?? ''}</QueryBoldSpan>
      </SuggestionItem>
    );
  });

  if (!expand || options.length === 0) {
    return null;
  }

  return (
    (
      <FloatBox>
        <SuggestionList role="listbox" id={props.id}>{options}</SuggestionList>
      </FloatBox>
    )
  );
});

export default Suggestions;
