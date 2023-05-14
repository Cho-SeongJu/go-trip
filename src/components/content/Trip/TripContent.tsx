import styled from '@emotion/styled';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { database } from '../../../../firebase';
import { uid } from '../../../store/data';
import Loading from '../../Loading';

interface DataType {
  [key: string]: string;
}

const TripContent = () => {
  const userAuth = useRecoilValue(uid);
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState<string>('글제목');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);

  const searchConditionArr = ['글제목', '작성자'];

  const CheckAuth = () => {
    if (userAuth === 'anonymous') {
      navigate('/user/login');
    } else {
      navigate('/writePost');
    }
  };

  const selecteValueHandle = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };

  const changeKeywordHandle = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
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
    try {
      const querySnapShot = await getDocs(collection(database, 'posts'));
      const data = querySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <Section>
        <FilterSection>
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
            <WritePostButton onClick={CheckAuth}>글쓰기</WritePostButton>
          </Form>
        </FilterSection>
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
    </>
  );
};

const Section = styled.div`
  margin: var(--common-margin);
  width: var(--common-width);
  min-height: calc(100vh - 10rem - 3.2rem - 79.981px);
`;

const FilterSection = styled.div`
  width: inherit;
`;

const SelectBoxSection = styled.div`
  margin: auto 0;
`;

const Form = styled.form`
  display: flex;
  float: right;
  margin-top: 2rem;
  margin-bottom: 3rem;
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
  border: 1px solid black;
  border-radius: 0.5rem;
  object-fit: contain;
`;

const Title = styled.p`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  font-size: 1.1rem;
  font-weight: 500;
`;

const Nickname = styled.p`
  margin: 0.5rem;
  font-size: 0.8rem;
`;

export default TripContent;
