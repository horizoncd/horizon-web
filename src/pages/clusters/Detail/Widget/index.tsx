import {
  Button, Divider,
} from 'antd';
import styled from 'styled-components';

const AvatarBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const AvatarText = styled.span`
  font-size: 25px;
  color: black;
`;

const FlexColumn = styled.div`
  flex-direction: column !important;
`;

const TitleText = styled.div`
  font-size: 25px;
  font-weight: 500;
  margin-left: 15px;
`;

const IDText = styled.div`
  margin-left: 15px;
`;

const DividerWithMargin = styled(Divider)`
  margin: 0 0 10px 0;
`;

const NoPaddingButton = styled(Button)`
  padding: 0 0;
`;

const CardTitle = styled.span`
  font-size: 17px;
  font-weight: 600;
`;

const BoldText = styled.span`
  font-weight: bold;
`;

export {
  AvatarBlock, AvatarText, FlexColumn, TitleText, IDText,
  BoldText, CardTitle, DividerWithMargin, NoPaddingButton,
};
