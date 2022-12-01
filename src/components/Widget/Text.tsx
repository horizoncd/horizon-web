import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const MainText = styled.span`
  color: ${(props: { theme: Theme }) => props.theme.color.emphasis};
`;

export const BoldText = styled.span`
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeight.bold};
`;
