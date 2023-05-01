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
        </HeaderDetailSection>
      </HeaderSection>
    </>
  );
};

const HeaderSection = styled.header`
  border-bottom: 2px solid var(--blue-sky-color);
`;

const HeaderDetailSection = styled.div`
  margin: var(--common-margin);
  max-width: var(--common-width);
`;

const HeaderLogo = styled.h1`
  width: 10rem;
  height: 4.5rem;
  background-color: white;
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const Link = styled.a`
  font-size: 5rem;
  text-indent: -9999px;
`;

export default Header;
