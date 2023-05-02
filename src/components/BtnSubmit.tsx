import styled from '@emotion/styled';

interface BtnSubmitType {
  children: string;
}

const BtnSubmit = (props: BtnSubmitType) => {
  return (
    <>
      <Button>{props.children}</Button>
    </>
  );
};

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 0.2rem;
  color: var(--white-color-1);
  font-size: 1rem;
  font-weight: 700;
  background-color: var(--blue-sky-color-1);
  cursor: pointer;
`;

export default BtnSubmit;
