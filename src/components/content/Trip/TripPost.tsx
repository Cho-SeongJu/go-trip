import styled from '@emotion/styled';
import { collection, getDocs } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { database } from '../../../../firebase';
import Loading from '../../Loading';
import { useRecoilValue } from 'recoil';
import { userInfo } from '../../../store/data';
import { Link } from 'react-router-dom';
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
      querySnapShot.docs.map((doc) => {
        console.log(doc.id);
      });

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
        ) : (
          <>
            {posts.map((post, index) => (
              <Post
                key={index}
                to={`/post/${post.ID}`}
              >
                <Img></Img>
                <Title>{post.TITLE}</Title>
                <Nickname>{post.NICKNAME}</Nickname>
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

const Post = styled(Link)`
  margin: 1rem;
  width: 20rem;
  height: 15rem;
  border: 1px solid black;
`;

const Img = styled.div``;

const Title = styled.p``;

const Nickname = styled.p``;

export default TripPost;
