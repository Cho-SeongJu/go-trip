import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const [path, setPath] = useState('');
  const homeRef = useRef(null);
  const tripRef = useRef(null);
  const location = useLocation();

  console.log(location);

  const onClickHandle = (params: string) => {
    // if (params === 'home') {
    //   console.log(homeRef.current);
    // } else if (params === 'trip') {
    // }

    setPath(params);
  };

  useEffect(() => {
    setPath(location.pathname);
  }, [location]);

  return (
    <>
      <NavSection>
        <Nav>
          <NavLinkDiv>
            <NavLink
              to="/"
              ref={homeRef}
              onClick={() => {
                onClickHandle('home');
              }}
            >
              홈
            </NavLink>
          </NavLinkDiv>
          <NavLinkDiv>
            <NavLink
              to="/trip"
              ref={tripRef}
              onClick={() => {
                onClickHandle('trip');
              }}
            >
              여행지
            </NavLink>
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
  font-size: 1.1rem;

  &.selected {
    color: var(--blue-sky-color-1);
    border-bottom: 2px solid var(--blue-sky-color-1);
    font-weight: 500;
  }

  &:not(.selected):hover {
    color: var(--blue-sky-color-1);
  }
`;

export default NavigationBar;
