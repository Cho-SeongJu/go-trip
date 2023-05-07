import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  const test = () => {
    return '';
  };

  return (
    <>
      <NavSection>
        <Nav>
          <NavLinkDiv>
            <NavLink
              to="/"
              className="selected"
              onMouseOver={test}
              onMouseLeave={test}
            >
              홈
            </NavLink>
          </NavLinkDiv>
          <NavLinkDiv>
            <NavLink to="/trip">여행지</NavLink>
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

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  height: 3rem;
  padding: 0 0.5rem;
  border-bottom: 2px solid var(--white-color-1);
  color: var(--black-color-1);

  &.selected {
    color: var(--blue-sky-color-1);
    border-bottom: 2px solid var(--blue-sky-color-1);
  }

  &:not(.selected):hover {
    color: var(--blue-sky-color-3);
  }
`;

export default NavigationBar;
