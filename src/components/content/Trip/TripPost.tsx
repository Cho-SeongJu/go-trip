import styled from '@emotion/styled';
import { collection, getDocs } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
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

      const data = querySnapShot.docs.map((doc) => ({
        ...doc.data(),
      }));

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
              <Post key={index}>asd</Post>
            ))}
          </>
        )}
      </PostSection>
    </>
  );
};

const PostSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  flex-wrap: wrap;
  width: var(--common-width);
`;

const Post = styled.div`
  margin: 1rem;
  width: 15rem;
  height: 5rem;
  border: 1px solid black;
`;

export default TripPost;
