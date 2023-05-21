import styled from '@emotion/styled';
import { DocumentData, collection, getDocs, orderBy, query, where } from 'firebase/firestore/lite';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import ReactPaginate from 'react-paginate';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { database } from '../../../../firebase';
import { areaCondition, filterArea } from '../../../store/area';
import { conditionArr, searchConditionArr } from '../../../store/condition';
import { uid } from '../../../store/data';
import { getExpireTime } from '../../../store/date';
import Area from '../../Area';
import Loading from '../../Loading';

interface DataType {
  [key: string]: string;
}

const TripContent = () => {
  const [selectedValue, setSelectedValue] = useState<string>('글제목');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>(areaCondition[0]);
  const [selectedCondition, setSelectedCondition] = useState<string>(conditionArr[0]);
  const [openConditionList, setOpenConditionList] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<DocumentData>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [, setCookie] = useCookies(['uid']);
  const userAuth = useRecoilValue(uid);
  const navigate = useNavigate();

  const itemsPerPage = 12;

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
        if (selectedArea === '전체') {
          if (selectedCondition === '전체') {
            q = query(postRef, where('TITLE', '==', searchKeyword), orderBy('CREATED_AT', 'desc'));
          } else if (selectedCondition === '조회수') {
            q = query(postRef, where('TITLE', '==', searchKeyword), orderBy('INQUIRE_COUNT', 'desc'));
          } else if (selectedCondition === '좋아요수') {
            q = query(postRef, where('TITLE', '==', searchKeyword), orderBy('LIKE_COUNT', 'desc'));
          }
        } else {
          const key = filterArea[selectedArea];
          if (selectedCondition === '전체') {
            q = query(postRef, where('TITLE', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('CREATED_AT', 'desc'));
          } else if (selectedCondition === '조회수') {
            q = query(postRef, where('TITLE', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('INQUIRE_COUNT', 'desc'));
          } else if (selectedCondition === '좋아요수') {
            q = query(postRef, where('TITLE', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('LIKE_COUNT', 'desc'));
          }
        }
      } else if (selectedValue === '작성자') {
        if (selectedArea === '전체') {
          if (selectedCondition === '전체') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), orderBy('CREATED_AT', 'desc'));
          } else if (selectedCondition === '조회수') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), orderBy('INQUIRE_COUNT', 'desc'));
          } else if (selectedCondition === '좋아요수') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), orderBy('LIKE_COUNT', 'desc'));
          }
        } else {
          const key = filterArea[selectedArea];
          if (selectedCondition === '전체') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('CREATED_AT', 'desc'));
          } else if (selectedCondition === '조회수') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('INQUIRE_COUNT', 'desc'));
          } else if (selectedCondition === '좋아요수') {
            q = query(postRef, where('NICKNAME', '==', searchKeyword), where('MAIN_ADDRESS', '==', key), orderBy('LIKE_COUNT', 'desc'));
          }
        }
      }

      if (q !== undefined) {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
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
    let firstQuery;
    try {
      if (selectedArea === '전체') {
        if (selectedCondition === '전체') {
          firstQuery = query(collection(database, 'posts'), orderBy('CREATED_AT', 'desc'));
        } else if (selectedCondition === '조회수') {
          firstQuery = query(collection(database, 'posts'), orderBy('INQUIRE_COUNT', 'desc'));
        } else if (selectedCondition === '좋아요수') {
          firstQuery = query(collection(database, 'posts'), orderBy('LIKE_COUNT', 'desc'));
        }
      } else {
        const key = filterArea[selectedArea];
        if (selectedCondition === '전체') {
          firstQuery = query(collection(database, 'posts'), where('MAIN_ADDRESS', '==', key), orderBy('CREATED_AT', 'desc'));
        } else if (selectedCondition === '조회수') {
          firstQuery = query(collection(database, 'posts'), where('MAIN_ADDRESS', '==', key), orderBy('INQUIRE_COUNT', 'desc'));
        } else if (selectedCondition === '좋아요수') {
          firstQuery = query(collection(database, 'posts'), where('MAIN_ADDRESS', '==', key), orderBy('LIKE_COUNT', 'desc'));
        }
      }

      if (firstQuery !== undefined) {
        const querySnapShot = await getDocs(firstQuery);
        const data = querySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
        setPosts(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const selecteValueHandle = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };

  const changeKeywordHandle = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const selectConditionHandle = (condition: string) => {
    setSelectedCondition(condition);
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', userAuth, { path: '/', expires: expireTime });
  };

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentPost(posts.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(posts.length / itemsPerPage));
  }, [posts, itemOffset, itemsPerPage]);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % posts.length;
    setItemOffset(newOffset);
  };

  const getData = useCallback(async () => {
    getPosts();
  }, [selectedArea, selectedCondition]);

  useEffect(() => {
    getData();
  }, [getData]);

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
        </SearchFormSection>
        <ConditionSection>
          <SelectedConditionSection onClick={() => (openConditionList ? setOpenConditionList(false) : setOpenConditionList(true))}>
            <SelectedCondition>{selectedCondition}</SelectedCondition>
            {openConditionList && (
              <ConditionList>
                {conditionArr.map((condition) => (
                  <Condition
                    key={condition}
                    onClick={() => selectConditionHandle(condition)}
                  >
                    {condition}
                  </Condition>
                ))}
              </ConditionList>
            )}
          </SelectedConditionSection>
        </ConditionSection>
      </FilterSection>
      <Section>
        <WriteSection>
          <WritePostButton onClick={CheckAuth}>글쓰기</WritePostButton>
        </WriteSection>
        <PostSection>
          {loading ? (
            <Loading display="flex" />
          ) : posts.length === 0 ? (
            <NonePostsSection>
              <NonePostsPharse>등록된 게시물이 없습니다.</NonePostsPharse>
            </NonePostsSection>
          ) : (
            <>
              {currentPost.map((post: DocumentData, index: number) => (
                <Post
                  key={index}
                  onClick={setCookieHandle}
                  to={`/post/${post.ID}`}
                >
                  <Img src={post.THUMBNAIL_IMAGE_URL} />
                  <DescriptionSection>
                    <Title>{post.TITLE}</Title>
                    <CountSection>
                      <Count>조회수 {post.INQUIRE_COUNT}</Count>
                      <Count>좋아요 {post.LIKE_COUNT}</Count>
                    </CountSection>
                    <WriterSection>
                      {post.PROFILE_IMAGE === '' ? (
                        <svg
                          width="1.7rem"
                          height="1.7rem"
                          viewBox="0 0 16 16"
                          fill="var(--blue-sky-color-1)"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
                          />
                          <path
                            fillRule="evenodd"
                            d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683z"
                          />
                          <path d="M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                        </svg>
                      ) : (
                        <ProfileImage
                          src={post.PROFILE_IMAGE}
                          alt="프로필 이미지"
                        />
                      )}
                      <Nickname>작성자 : {post.NICKNAME}</Nickname>
                    </WriterSection>
                  </DescriptionSection>
                </Post>
              ))}
            </>
          )}
        </PostSection>
        {posts.length > 0 && (
          <PaginationContainer>
            <ReactPaginate
              previousLabel={'이전'}
              nextLabel={'다음'}
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={15}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              activeClassName={'active'}
              previousClassName={'pageLabelBtn'}
              nextClassName={'pageLabelBtn'}
            />
          </PaginationContainer>
        )}
      </Section>
    </>
  );
};

const Section = styled.div`
  margin: var(--common-margin);
  max-width: var(--common-width);
  min-height: calc(100vh - 10rem - 3.2rem - 216.981px);
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 8.22rem;
  width: 100vw;
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
  display: flex;
  flex-direction: row-reverse;
  max-width: var(--common-width);

  @media screen and (max-width: 1023px) {
    max-width: 43.75rem;
    margin: 0 auto;
  }
`;

const WritePostButton = styled.button`
  margin-top: 1.5rem;
  margin-right: 3rem;
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

const ConditionSection = styled.div`
  display: flex;
  align-items: center;
  width: 8rem;
`;

const SelectedConditionSection = styled.div`
  margin: auto 0;
  margin-left: 2rem;
  width: 5rem;
  height: 2.4rem;
`;

const SelectedCondition = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 2.4rem;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.3rem;
  border-top-left-radius: 0.3rem;
  border-top-right-radius: 0.3rem;
  cursor: pointer;
`;

const ConditionList = styled.div`
  width: 5rem;
  border: 1px solid var(--gray-color-2);
  border-top: none;
`;

const Condition = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 2rem;
  border-bottom: 1px solid var(--gray-color-2);
  font-size: 0.9rem;
  cursor: pointer;
  background-color: var(--white-color-1);

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--blue-sky-color-1);
    color: var(--white-color-1);
  }
`;

const PostSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  flex-wrap: wrap;
  width: var(--common-width);
  margin-top: 3rem;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    width: 900px;
    margin: 0 auto;
  }
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
  margin: auto;
  margin-top: 2rem;
  width: 15rem;
  height: 25rem;
  color: var(--black-color-1);

  &:hover > img {
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
  width: 15rem;
`;

const Img = styled.img`
  width: 15rem;
  height: 15rem;
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

const CountSection = styled.div`
  display: flex;
  margin-top: 0.3rem;
`;

const Count = styled.p`
  color: var(--gray-color-3);
  font-weight: 300;
  font-size: 0.8rem;

  &:first-of-type {
    margin-right: 0.5rem;
  }
`;

const WriterSection = styled.div`
  display: flex;
  margin-top: 0.7rem;

  & > svg {
    margin: auto 0;
  }
`;

const Nickname = styled.p`
  margin: 0.5rem;
  font-size: 0.9rem;
`;

const ProfileImage = styled.img`
  width: 1.7rem;
  height: 1.7rem;
  object-fit: contain;
  border-radius: 100%;
`;

const PaginationContainer = styled.div`
  width: var(--common-post-width);
  height: 2rem;
  margin: var(--common-margin);
  margin-bottom: 3rem;
`;
export default TripContent;
