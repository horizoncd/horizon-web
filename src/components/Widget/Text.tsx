import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const MainText = styled.span`
    color: ${(props: { theme: Theme }) => props.theme.color.emphasis};
`;
