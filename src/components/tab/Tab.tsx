import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { uid } from '../../store/data';
import { getExpireTime } from '../../store/date';

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
  const [, setCookie] = useCookies(['uid']);
  const userId = useRecoilValue(uid);

  const tabMenu: TabMenuType = {
    home: {
      path: '/',
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
    myPost: {
      path: '/user/profile/myPost',
      label: '내가 쓴 글',
    },
    editPassword: {
      path: '/user/profile/editPassword',
      label: '비밀번호설정',
    },
  };

  const [path, setPath] = useState('/');
  const location = useLocation();

  const onClickHandle = (params: string) => {
    const expireTime = getExpireTime();
    setCookie('uid', userId, { path: '/', expires: expireTime });
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
                className={tabMenu[type].path === path ? 'selected' : ''}
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
  position: sticky;
  top: 5.05rem;
  z-index: 9999;
  width: 100vw;
  border-bottom: 1px solid var(--gray-color-2);
  background-color: var(--white-color-1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  max-width: var(--common-width);
  margin: var(--common-margin);

  @media screen and (max-width: 1023px) {
    max-width: 40rem;
  }

  @media screen and (max-width: 767px) {
    max-width: 30rem;
  }

  @media screen and (max-width: 480px) {
    max-width: 20rem;
  }
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
