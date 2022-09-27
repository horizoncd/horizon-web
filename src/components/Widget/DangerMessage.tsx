import styled from 'styled-components';

const DangerMessage = styled.span`
    color: ${(props: { theme: Theme }) => props.theme.color.danger};
`;

export default DangerMessage;
