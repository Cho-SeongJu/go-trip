import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import logo from '../../public/logo.svg';

const Logo = () => {
  return (
    <>
      <Heading>
        <HomeLink to="/" />
      </Heading>
    </>
  );
};

const Heading = styled.h1`
  width: 8rem;
  height: 2.8rem;
`;

const HomeLink = styled(Link)`
  display: block;
  width: 8rem;
  height: 2.8rem;
  font-size: 2rem;
  text-indent: -9999px;
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

export default Logo;
