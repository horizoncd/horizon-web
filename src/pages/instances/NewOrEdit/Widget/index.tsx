import styled from 'styled-components';

const Step = styled.div`
margin-top: 16px;
`;
const StepContent = styled.div`
margin-top: 16px;
padding: 20px;
background-color: #fafafa;
border: 1px dashed #e9e9e9;
border-radius: 2px;
`;
const StepAction = styled.div`
float: right;
margin-top: 24px;
margin-right: 24px;
`;

const ModalTitle = styled.span`
font-weight: bold;
`;

const ModalContent = styled.div`
color: #938888;
white-space: pre-line;
`;

export {
  Step, StepContent, StepAction, ModalTitle, ModalContent,
};
