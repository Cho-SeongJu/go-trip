import styled from '@emotion/styled';
import { collection, getDocs } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../../../../firebase';
import Loading from '../../Loading';

interface DataType {
  [key: string]: string;
}

const TripPost = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<DataType[]>([]);

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
    </>
  );
};

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

export default TripPost;
