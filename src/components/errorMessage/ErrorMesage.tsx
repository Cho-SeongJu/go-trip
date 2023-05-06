import styled from '@emotion/styled';

interface PropsType {
  children: React.ReactNode;
  role: string;
}

const ErrorMessage = (props: PropsType) => {
  return <AlertMessage>{props.children}</AlertMessage>;
};

const AlertMessage = styled.small`
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  color: var(--red-color-1);
`;

export default ErrorMessage;
