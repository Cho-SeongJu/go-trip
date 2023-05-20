import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { uid } from '../store/data';
import { useRecoilValue } from 'recoil';
import { getExpireTime } from '../store/date';

const Logo = () => {
  const [, setCookie] = useCookies(['uid']);
  const userId = useRecoilValue(uid);

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userId, { path: '/', expires: expireTime });
  };

  return (
    <>
      <Heading>
        <HomeLink
          onClick={setCookieHandle}
          to="/"
        />
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
  background-image: url('./public/logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
`;

export default Logo;
