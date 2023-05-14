import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface PropsType {
  menu: string[];
}

interface TabMenuType {
  [key: string]: {
    path: string;
    label: string;
  };
}

const Tab = (props: PropsType) => {
  const tabMenu: TabMenuType = {
    home: {
      path: '/',
      label: '홈',
    },
    trip: {
      path: '/trip',
      label: '여행지',
    },
    editUserInfo: {
      path: '/user/profile/editUserInfo',
      label: '회원정보수정',
    },
    likeList: {
      path: '/user/profile/likeList',
      label: '좋아요 목록',
    },
    editPassword: {
      path: '/user/profile/editPassword',
      label: '비밀번호설정',
    },
  };

  console.log(props.menu);

  const [path, setPath] = useState('');
  const homeRef = useRef(null);
  const tripRef = useRef(null);
  const location = useLocation();

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
          {props.menu.map((type, index) => (
            <NavLinkDiv key={`${type}${index}`}>
              <NavLink
                to={tabMenu[type].path}
                onClick={() => {
                  onClickHandle('home');
                }}
              >
                {tabMenu[type].label}
              </NavLink>
            </NavLinkDiv>
          ))}
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

export default Tab;
