import styled from 'styled-components';

const BoldText = styled.span`
    font-weight: ${(props: { theme: Theme }) => props.theme.fontWeight};
    font-size: ${(props: { theme: Theme }) => props.theme.fontSize.large};
`;

export default BoldText;
