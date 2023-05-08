import styled from '@emotion/styled';

const TripPost = () => {
  return (
    <>
      <PostSection>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
        <Post>asd</Post>
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
