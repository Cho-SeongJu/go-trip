import styled from '@emotion/styled';

const NavigationBar = () => {
  return (
    <>
      <NavSection>
        <Nav>
          <NavLinkDiv>
            <NavLink>홈</NavLink>
          </NavLinkDiv>
          <NavLinkDiv>
            <NavLink>여행지</NavLink>
          </NavLinkDiv>
        </Nav>
      </NavSection>
    </>
  );
};

const NavSection = styled.div`
  width: 100%;
  border-bottom: 1px solid var(--gray-color-2);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  max-width: var(--common-width);
  margin: var(--common-margin);
`;

const NavLinkDiv = styled.div``;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  height: 3rem;
  border-bottom: 2px solid var(--white-color-1);
  padding: 0 0.5rem;

  &:hover {
    border-bottom: 2px solid var(--blue-sky-color-1);
  }
`;

export default NavigationBar;
