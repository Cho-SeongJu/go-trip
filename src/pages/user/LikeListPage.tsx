import styled from '@emotion/styled';
import { DocumentData, collection, documentId, getDocs, query, where } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';
import { userInfo } from '../../store/data';
import { myPagemenu } from '../../store/menu';
import { DataType } from '../../type/type';
import ReactPaginate from 'react-paginate';

const LikeListPage = () => {
  const loginUserNickname = useRecoilValue(userInfo);
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);
  const [currentPost, setCurrentPost] = useState<DocumentData>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  const itemsPerPage = 12;

  const getPosts = async () => {
    setLoading(true);
    try {
      const likeRef = collection(database, 'like');
      const likeQuery = query(likeRef, where('nickname', '==', loginUserNickname.NICKNAME));
      const likeQuerySnapShot = await getDocs(likeQuery);
      const likeData = likeQuerySnapShot.docs.map((doc) => ({ ...doc.data() }.postID));

      const likePostRef = collection(database, 'posts');
      const likePostQuery = query(likePostRef, where(documentId(), 'in', likeData));
      const likePostQuerySnapShot = await getDocs(likePostQuery);
      const likePostData = likePostQuerySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));

      setPosts(likePostData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <Header />
      <Tab menu={myPagemenu} />
      <Section>
        <PostSection>
          {loading ? (
            <Loading display="flex" />
          ) : posts.length === 0 ? (
            <NonePostsSection>
              <NonePostsPharse>좋아한 게시물이 없습니다.</NonePostsPharse>
            </NonePostsSection>
          ) : (
            <>
              {currentPost.map((post: DocumentData, index: number) => (
                <Post
                  key={index}
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
                      {post.PROFILE_IMAGE === undefined ? (
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
      <Footer />
    </>
  );
};

const Section = styled.div`
  margin: var(--common-margin);
  width: var(--common-width);
  min-height: calc(100vh - 10rem - 3.2rem - 79.981px);
`;

const PostSection = styled.div`
  margin-top: 3rem;
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
  width: 20rem;
`;

const Img = styled.img`
  width: 20rem;
  height: 15rem;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.5rem;
  object-fit: contain;
`;

const Title = styled.p`
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
export default LikeListPage;
