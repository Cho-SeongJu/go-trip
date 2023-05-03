import styled from '@emotion/styled';

interface InputPropsTypes {
  type: string;
  placeholder: string;
  id: string;
  name: string;
}

const Input = (props: InputPropsTypes) => {
  return (
    <>
      <InputBox
        type={props.type}
        placeholder={props.placeholder}
        id={props.id}
        name={props.name}
      />
    </>
  );
};

const InputBox = styled.input`
  padding: 1rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  outline: none;

  &:not(:last-of-type) {
    margin-bottom: 0.5rem;
  }
`;

export default Input;