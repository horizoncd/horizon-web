import { MouseEventHandler } from 'react';
import styled from 'styled-components';

const BorderlessButton = styled.button`
    border: 0;
    align-items: center;
    background: rgb(0,0,0,0,85);
    border-radius: 3px;
    display: inline-flex;
    justify-content: center;
    padding: 0.15rem 0.25rem;
    margin-right: 3px;
    
    &:hover {
      cursor: pointer;
      background-color: #b0afaa;
    }

    button {
      background: none;
      border: 0;
      border-radius: 50%;
      cursor: pointer;
      line-height: inherit;
      padding: 0 0.5rem
    }
`;

const CloseButton = styled.span`
  margin-left: 5px;
  cursor: pointer;
  :hover {
    color: red;
  }
`;

interface TagProps {
  text: string,
  remove?: any,
  onClick?: () => void,
  onBlur?: () => void,
}

export default function Tag({
  text, remove, onClick, onBlur,
}: TagProps) {
  const handleOnRemove: MouseEventHandler = (e) => {
    e.stopPropagation();
    remove(text);
  };

  return (
    <BorderlessButton
      onBlur={onBlur}
      type="button"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <span
        onClick={onClick}
      >
        {text}

      </span>
      {remove && (
        <CloseButton
          onClick={handleOnRemove}
          aria-label={`remove ${text}`}
        >
          &#10005;
        </CloseButton>
      )}
    </BorderlessButton>
  );
}

Tag.defaultProps = {
  remove: undefined,
  onClick: () => {},
  onBlur: () => {},
};
