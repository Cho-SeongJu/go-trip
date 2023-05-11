import { doc, getDoc } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../../../firebase';
import Header from '../../components/header/Header';
import Loading from '../../components/Loading';
import { DocumentData } from 'firebase/firestore/lite';
import styled from '@emotion/styled';
import Footer from '../../components/footer/Footer';
import TextareaAutosize from 'react-textarea-autosize';

// interface PostDataType {
//   UID: string;
//   NICKNAME: string;
//   TITLE: string;
//   CONTENT: string;
// }

const PostDetailPage = () => {
  const { seq } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<DocumentData>({});

  const getPost = async () => {
    const filterParams = String(seq);
    console.log(filterParams);
    const docRef = doc(database, 'posts', filterParams);

    try {
      setLoading(true);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert('존재하지 않는 게시물입니다.');
        history.back();
        return;
      } else {
        const data: DocumentData = docSnap.data();
        console.log(data);
        if (data !== undefined) {
          setPostData(data);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost();
  }, []);

  return (
    <>
      <Header />
      {loading ? (
        <Loading display="flex" />
      ) : (
        <Section>
          <CarouselSection></CarouselSection>
          <Title>{postData.TITLE}</Title>
          <Profile>
            {/* <ProfileImage src=""/> */}
            <ProfileImage>.</ProfileImage>
            <ProfileInfo>
              <ProfilePharse>작성자 : {postData.NICKNAME}</ProfilePharse>
              <ProfilePharse>작성일 : 2023-05-11</ProfilePharse>
            </ProfileInfo>
          </Profile>
          <Content>{postData.CONTENT}</Content>
          <CommentSection>
            <CommentTitle>댓글</CommentTitle>
            <CommentInputSection>
              <TextareaAutosize
                className="comment"
                autoFocus
                rows={1}
                placeholder="좋은 댓글 부탁드립니다 :)"
              />
              <CommentInputEnter>입력</CommentInputEnter>
            </CommentInputSection>
          </CommentSection>
        </Section>
      )}
      <Footer />
    </>
  );
};

const Section = styled.div`
  width: var(--common-post-width);
  margin: var(--common-margin);
`;

const CarouselSection = styled.div`
  margin: 0 auto;
  margin-top: 5rem;
  width: var(--common-post-width);
  height: 30rem;
  border: 1px solid black;
`;

const Title = styled.h1`
  margin-top: 2rem;
  font-size: 2rem;
  font-weight: 500;
`;

const Profile = styled.div`
  margin-top: 1rem;
  display: flex;
`;

// const ProfileImage = styled.img``;
const ProfileImage = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
  text-align: center;
  background-color: var(--gray-color-3);
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
`;
const ProfilePharse = styled.p`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

const Content = styled.p`
  padding: 2rem 0;
  border-bottom: 1px solid var(--gray-color-2);
`;

const CommentSection = styled.div`
  margin-top: 2rem;
`;

const CommentTitle = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
`;

const CommentInputSection = styled.div`
  display: flex;
  margin: 2rem 0;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.2rem;
`;

const CommentInputEnter = styled.span`
  flex-grow: 1;
  padding-top: 1rem;
  text-align: center;
  color: var(--gray-color-3);
`;

export default PostDetailPage;
