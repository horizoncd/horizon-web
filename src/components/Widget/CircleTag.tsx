import styled from 'styled-components';

const CircleTag = styled.span`
  ${((props) => (props.onClick ? '&:hover { cursor: pointer; text-decoration: underline; }' : ''))}

  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: inline-block;
  color: #666;
  font-size: 12px;
  line-height: 20px;
  border: 1px solid #dbdbdb;
  border-radius: 100px;
  font-weight: 400;
`;

export default CircleTag;
