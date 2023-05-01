import styled from '@emotion/styled';
import logo from '../../../public/logo.svg';

const Header = () => {
  return (
    <>
      <HeaderSection>
        <HeaderDetailSection>
          <HeaderLogo>
            <Link />
          </HeaderLogo>
          <HeaderUserSection></HeaderUserSection>
        </HeaderDetailSection>
      </HeaderSection>
    </>
  );
};

const HeaderSection = styled.header`
  border-bottom: 2px solid var(--blue-sky-color-1);
`;

const HeaderDetailSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin: var(--common-margin);
  max-width: var(--common-width);
`;

const HeaderLogo = styled.h1`
  width: 10rem;
  height: 3rem;
  background-color: var(--white-color-1);
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const HeaderUserSection = styled.div`
  width: 200px;
  height: 3rem;
  border: 1px solid black;
`;

const Link = styled.a`
  font-size: 5rem;
  text-indent: -9999px;
`;

export default Header;
