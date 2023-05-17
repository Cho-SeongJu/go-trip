import styled from '@emotion/styled';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import Tab from '../../components/tab/Tab';
import { useRecoilValue } from 'recoil';
import { userInfo } from '../../store/data';
import { useEffect, useState } from 'react';
import { myPagemenu } from '../../store/menu';
import { DataType } from '../../type/type';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore/lite';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';

const MyPostPage = () => {
  const loginUserNickname = useRecoilValue(userInfo);
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);

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

export default MyPostPage;
