import { useRequest } from 'umi';
import { CSSProperties, ReactNode, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Space } from 'antd';
import { listPrMessage } from '@/services/pipelineruns/pipelineruns';
import {
  BoldText, CircleTag, PopupTime, RandomAvatar,
} from '@/components/Widget';

interface DialogHeaderProps {
  right?: boolean
}

const DialogHeader = styled.div<DialogHeaderProps>`
  position: relative;
  border: 1px solid #F0F0F0;
  display: 'inline-block';
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;

  &::before {
    content: '';
    width: 12px;
    height: 18px;
    background-color: #F0F0F0;
    ${(props) => (props.right
    ? 'clip-path: polygon(0 0, 0 100%, 100% 50%); right: -12px;'
    : 'clip-path: polygon(0 50%, 100% 100%, 100% 0); left: -12px;')}

    position: absolute;
    top: 10px;
  }

  &::after {
    content: '';
    width: 12px;
    height: 18px;
    background-color: #FFF;
    ${(props) => (props.right
    ? 'clip-path: polygon(0 0, 0 100%, 100% 50%); right: -10px;'
    : 'clip-path: polygon(0 50%, 100% 100%, 100% 0); left: -10px;')}

    border-bottom-color: #F0F0F0;
    position: absolute;
    top: 10px;
  }
`;

DialogHeader.propTypes = {
  right: PropTypes.bool,
};

const DialogContent = styled.div`
    border: 1px solid #F0F0F0;
    border-top: transparent;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 22px;
    padding-right: 22px;

    font-size: 1.1rem;
`;

interface DialogProps {
  content: ReactNode
  name: string,
  time: string,
  tag?: string,
  right?: boolean
  style?: CSSProperties
}

const Dialog = (props: DialogProps) => {
  const {
    content, right = false, style = {},
    name = 'noname', time, tag,
  } = props;
  return (
    <div style={style}>
      <DialogHeader right={right}>
        <Space>
          <BoldText>{name}</BoldText>
          {
            tag && <CircleTag>{tag}</CircleTag>
          }
          <PopupTime time={time} />
        </Space>
      </DialogHeader>
      <DialogContent>
        {content}
      </DialogContent>
    </div>
  );
};

interface MessageProps {
  content: string;
  userName: string
  time: string
  isBot?: boolean
  right?: boolean
}

const Message = (props: MessageProps) => {
  const {
    content, userName, time, isBot, right = false,
  } = props;

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      { !right && <RandomAvatar size={50} name={userName} />}
      <Dialog
        right={right}
        style={{ flexGrow: '1' }}
        content={content}
        name={userName}
        time={time}
        tag={isBot ? 'bot' : undefined}
      />
      { right && <RandomAvatar size={50} name={userName} />}
    </div>
  );
};

interface MessageBoxProps {
  pipelinerunID: number;
}

const MessageBox = (props: MessageBoxProps) => {
  const { pipelinerunID } = props;
  const [items, setItems] = useState<PIPELINES.PrMessage[]>([]);
  const [count, setCount] = useState(0);

  useRequest(() => listPrMessage(pipelinerunID), {
    onSuccess: (data) => {
      setCount(data.total);
      setItems(data.items);
    },
  });

  if (count === 0) {
    return (
      <div />
    );
  }

  return (
    <div>
      {
        items.map((item) => (
          <Message
            isBot={item.createdBy.userType === 'bot'}
            content={item.content}
            userName={item.createdBy.name}
            time={item.createdAt}
          />
        ))
    }
    </div>
  );
};

export default MessageBox;
