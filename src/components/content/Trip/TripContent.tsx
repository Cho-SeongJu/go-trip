import styled from '@emotion/styled';
import { DocumentData, collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore/lite';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { database } from '../../../../firebase';
import { uid } from '../../../store/data';
import Loading from '../../Loading';
import { getExpireTime } from '../../../store/date';
import { useCookies } from 'react-cookie';
import Area from '../../Area';
import { filterArea } from '../../../store/area';

interface DataType {
  [key: string]: string;
}

const TripContent = () => {
  const [selectedValue, setSelectedValue] = useState<string>('글제목');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);
  const [target, setTarget] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [lastVisible, setlastVisible] = useState<DocumentData>();
  const [, setCookie] = useCookies(['uid']);
  const loader = useRef<HTMLDivElement>(null);
  const userAuth = useRecoilValue(uid);
  const navigate = useNavigate();

  const searchConditionArr = ['글제목', '작성자'];

  const CheckAuth = () => {
    if (userAuth === 'anonymous') {
      navigate('/user/login');
    } else {
      const expireTime = getExpireTime();
      setCookie('uid', userAuth, { path: '/', expires: expireTime });
      navigate('/writePost');
    }
  };

  const submitHandle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchKeyword.length === 0) {
      alert('검색할 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const postRef = collection(database, 'posts');
      let q;
      if (selectedValue === '글제목') {
        q = query(postRef, where('TITLE', '==', searchKeyword));
      } else if (selectedValue === '작성자') {
        q = query(postRef, where('NICKNAME', '==', searchKeyword));
      }

      if (q !== undefined) {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
        console.log(data);
        setPosts(data);
      }
    } catch (error) {
      console.log(error);
      alert('게시글 조회 중 오류가 발생하였습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPosts = async () => {
    setLoading(true);
    // if (posts.length === 0) {
    try {
      let firstQuery;
      if (selectedArea === '전체') {
        firstQuery = query(collection(database, 'posts'), orderBy('CREATED_AT', 'desc'), limit(15));
      } else {
        const key = filterArea[selectedArea];
        console.log(selectedArea);
        console.log(key);
        firstQuery = query(collection(database, 'posts'), where('MAIN_ADDRESS', '==', key), orderBy('CREATED_AT', 'desc'), limit(15));
      }

      const querySnapShot = await getDocs(firstQuery);
      const data = querySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
      setPosts(data);
      setlastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // } else {
    // console.log(lastVisible);
    // try {
    //   const next = query(collection(database, 'posts'), orderBy('CREATED_AT'), startAfter(lastVisible), limit(15));
    //   const nextDocumentSnapshots = await getDocs(next);
    //   for (let i = 0; i < nextDocumentSnapshots.docs.length; i++) {
    //     console.log(nextDocumentSnapshots.docs[i].data());
    //   }
    //   const nextData = nextDocumentSnapshots.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
    //   setPosts([...posts, ...nextData]);
    // } catch (error) {
    //   console.log(error);
    // } finally {
    //   setLoading(false);
    // }
    // }
  };

  const infinity = async () => {
    // const first = query(collection(database, 'posts'), orderBy('CREATE_AT'), limit(2));
    // const documentSnapshots = await getDocs(first);
    // for (let i = 0; i < documentSnapshots.docs.length; i++) {
    //   console.log(documentSnapshots.docs[i].data());
    // }
    // console.log(documentSnapshots.docs);

    // const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    console.log(lastVisible);
    const next = query(collection(database, 'posts'), orderBy('CREATED_AT'), startAfter(lastVisible), limit(15));
    try {
      const nextDocumentSnapshots = await getDocs(next);
      for (let i = 0; i < nextDocumentSnapshots.docs.length; i++) {
        console.log(nextDocumentSnapshots.docs[i].data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selecteValueHandle = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };

  const changeKeywordHandle = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userAuth, { path: '/', expires: expireTime });
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    getPosts();
  }, [selectedArea]);

  return (
    <>
      <FilterSection>
        <Area
          setSelectedArea={setSelectedArea}
          selectedArea={selectedArea}
        />
        <SearchFormSection>
          <Form onSubmit={submitHandle}>
            <SelectBoxSection>
              <Selectbox
                name="searchType"
                onChange={selecteValueHandle}
              >
                {searchConditionArr.map((item, index) => (
                  <option
                    value={item}
                    key={index}
                  >
                    {item}
                  </option>
                ))}
              </Selectbox>
            </SelectBoxSection>
            <SearchKeywordSection>
              <SearchKeyword
                type="text"
                onChange={changeKeywordHandle}
              />
              <BtnSearch>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0,0,256,256"
                  width="20px"
                  height="20px"
                  fillRule="nonzero"
                >
                  <g
                    fillOpacity="0.4"
                    fill="#000000"
                    fillRule="nonzero"
                    stroke="none"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDasharray=""
                    strokeDashoffset="0"
                    fontFamily="none"
                    fontWeight="none"
                    fontSize="none"
                    textAnchor="none"
                  >
                    <g transform="scale(5.12,5.12)">
                      <path d="M21,3c-9.39844,0 -17,7.60156 -17,17c0,9.39844 7.60156,17 17,17c3.35547,0 6.46094,-0.98437 9.09375,-2.65625l12.28125,12.28125l4.25,-4.25l-12.125,-12.09375c2.17969,-2.85937 3.5,-6.40234 3.5,-10.28125c0,-9.39844 -7.60156,-17 -17,-17zM21,7c7.19922,0 13,5.80078 13,13c0,7.19922 -5.80078,13 -13,13c-7.19922,0 -13,-5.80078 -13,-13c0,-7.19922 5.80078,-13 13,-13z"></path>
                    </g>
                  </g>
                </svg>
              </BtnSearch>
            </SearchKeywordSection>
          </Form>
          <WriteSection>
            <WritePostButton onClick={CheckAuth}>글쓰기</WritePostButton>
          </WriteSection>
        </SearchFormSection>
      </FilterSection>
      <Section>
        <PostSection>
          {loading ? (
            <Loading display="flex" />
          ) : posts.length === 0 ? (
            <NonePostsSection>
              <NonePostsPharse>등록된 게시물이 없습니다.</NonePostsPharse>
            </NonePostsSection>
          ) : (
            <>
              {posts.map((post, index) => (
                <Post
                  key={index}
                  onClick={setCookieHandle}
                  to={`/post/${post.ID}`}
                >
                  <Img src={post.THUMBNAIL_IMAGE_URL} />
                  <DescriptionSection>
                    <Title>{post.TITLE}</Title>
                    <Nickname>작성자 : {post.NICKNAME}</Nickname>
                  </DescriptionSection>
                </Post>
              ))}
            </>
          )}
        </PostSection>
      </Section>
      <div ref={loader} />
    </>
  );
};

const Section = styled.div`
  margin: var(--common-margin);
  width: var(--common-width);
  min-height: calc(100vh - 10rem - 3.2rem - 79.981px);
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 8.22rem;
  height: 8.5rem;
  background-color: var(--white-color-1);
  box-shadow: 1px 3px 5px var(--gray-color-2);
  z-index: 9999;
`;

const SearchFormSection = styled.div`
  display: flex;
`;

const SelectBoxSection = styled.div`
  margin: auto 0;
`;

const Form = styled.form`
  display: flex;
  float: right;
`;

const WriteSection = styled.div`
  margin: auto 0;
`;

const Selectbox = styled.select`
  padding: 0.8rem;
  font-size: 0.8rem;
  border: 1px solid var(--gray-color-1);
  outline: none;
  background-color: #fff;
`;

const SearchKeywordSection = styled.div`
  display: flex;
  margin: auto 0.3rem;
  border: 1px solid var(--gray-color-1);
`;

const SearchKeyword = styled.input`
  padding: 0.8rem;
  outline: none;
  border: none;
  width: 13rem;
`;

const BtnSearch = styled.button`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
  border: none;
  background-color: var(--white-color-1);
  cursor: pointer;
`;

const WritePostButton = styled.button`
  margin-left: 3rem;
  padding: 0.7rem 1rem;
  background-color: var(--blue-sky-color-1);
  color: var(--white-color-1);
  border: none;
  border-radius: 0.2rem;
  cursor: pointer;

  &: hover {
    opacity: 0.8;
  }
`;

const PostSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  flex-wrap: wrap;
  width: var(--common-width);
  margin-top: 2rem;
`;

const NonePostsSection = styled.div`
  display: flex;
  width: inherit;
  height: calc(100vh - 10rem - 3.2rem - 15rem);
  justify-content: center;
  align-items: center;
`;

const NonePostsPharse = styled.p``;

const Post = styled(Link)`
  margin: 1rem;
  width: 20rem;
  height: 22rem;
  color: var(--black-color-1);

  &:hover img {
    transform: scale(1.1);
  }

  & img {
    transition: all 0.1s linear;
  }
`;

const DescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20rem;
`;

const Img = styled.img`
  width: 20rem;
  height: 15rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.5rem;
  object-fit: contain;
`;

const Title = styled.div`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  font-size: 1.1rem;
  font-weight: 500;
  word-break: break-all;
`;

const Nickname = styled.p`
  margin: 0.5rem;
  font-size: 0.8rem;
`;

export default TripContent;
