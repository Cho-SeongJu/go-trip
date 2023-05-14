import styled from '@emotion/styled';
import { DocumentData, arrayRemove, arrayUnion, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore/lite';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import ViewMoreIcon from '../../components/ViewMore';
import CarouselComponent from '../../components/carousel/CarouselComponent';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';
import { postDetailData } from '../../store/postDetail';

interface ColorPropsType {
  color: string;
}

interface CommentItemType {
  comment: string;
  nickname: string;
  uid: string;
  seq: number;
}

const PostDetailPage = () => {
  const { postID } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<DocumentData>({});
  const [comment, setComment] = useState<CommentItemType[]>([]);
  const [moreMenuStatus, setMoreMenuStatus] = useState<boolean>(false);
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [commentDisabled, setCommentDisabled] = useState<boolean[]>([]);
  const commentRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const setRecoilPostData = useSetRecoilState(postDetailData);
  const loginUser = useRecoilValue(uid);
  const loginUserNickname = useRecoilValue(userInfo);

  const moreMenu = [
    {
      mode: 'edit',
      label: '수정',
    },
    {
      mode: 'delete',
      label: '삭제',
    },
  ];

  const getPost = async () => {
    const filterParams = String(postID);
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
        setRecoilPostData(data);
        if (data !== undefined) {
          setPostData(data);
        }
      }
      getComment();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getComment = async () => {
    const filterParams = String(postID);
    const commentRef = doc(database, 'comments', filterParams);
    const commentDocSnap = await getDoc(commentRef);
    if (commentDocSnap.exists()) {
      const commentData: DocumentData = commentDocSnap.data();
      setComment(Array.from(commentData['comment']));
      const arrLength = Array.from(commentData['comment']).length;
      const booleanArr = new Array(arrLength).fill(true);
      setCommentDisabled(booleanArr);
    }
  };

  const openMoreMenuHandle = () => {
    moreMenuStatus ? setMoreMenuStatus(false) : setMoreMenuStatus(true);
  };

  const menuClickHandle = async (mode: string) => {
    if (mode === 'edit') {
      navigate(`/post/edit/${postID}`);
    } else if (mode === 'delete') {
      const confirmResult = confirm('삭제하시겠습니까?');

      if (confirmResult) {
        try {
          await deleteDoc(doc(database, 'posts', String(postID)));
          alert('삭제가 정상적으로 되었습니다!');
          navigate('/trip');
        } catch (error) {
          alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 삭제를 하세요.');
          return;
        }
      } else return;
    }
  };

  const TextAreaChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value);
  };

  const onSubmitCommentHandle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (textAreaValue.length === 0) {
      alert('댓글을 입력해주세요.');
      return;
    }

    let commentSeq = 0;
    const commentDocRef = doc(database, 'comments', String(postID));

    try {
      if (comment.length === 0) {
        await setDoc(commentDocRef, {
          comment: arrayUnion({ comment: textAreaValue, nickname: loginUserNickname.NICKNAME, uid: loginUser, seq: commentSeq }),
        });
      } else {
        commentSeq = comment[comment.length - 1].seq;
        await updateDoc(commentDocRef, {
          comment: arrayUnion({ comment: textAreaValue, nickname: loginUserNickname.NICKNAME, uid: loginUser, seq: commentSeq }),
        });
      }
      getComment();
      setTextAreaValue('');
    } catch (error) {
      alert('댓글 등록을 실패하였습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const DeleteCommentHandle = async (item: CommentItemType) => {
    const result = confirm('댓글을 삭제하시겠습니까?');
    const commentDocRef = doc(database, 'comments', String(postID));

    if (result) {
      try {
        await updateDoc(commentDocRef, {
          comment: arrayRemove({
            comment: item.comment,
            nickname: item.nickname,
            seq: item.seq,
            uid: item.uid,
          }),
        });
        getComment();
      } catch (error) {
        console.log(error);
      }
    }
    console.log('');
  };

  const switchCommentDisabledHandle = (index: number) => {
    // if (commentRef.current !== null) {
    //   commentRef.current.disabled = false;
    // }
    const copyCommentDisabled: boolean[] = [];

    commentDisabled.forEach((element) => {
      copyCommentDisabled.push(element);
    });

    copyCommentDisabled[index] = true;

    setCommentDisabled(copyCommentDisabled);
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
          <MoreViewSection>
            {postData.UID === loginUser && (
              <MoreView onClick={openMoreMenuHandle}>
                <ViewMoreIcon />
                {moreMenuStatus && (
                  <MoreMenuModal>
                    {moreMenu.map((menu) => (
                      <Menu
                        key={menu.mode}
                        onClick={() => menuClickHandle(menu.mode)}
                      >
                        {menu.label}
                      </Menu>
                    ))}
                  </MoreMenuModal>
                )}
              </MoreView>
            )}
          </MoreViewSection>
          <CarouselSection>
            <CarouselComponent
              imageList={postData.IMAGE_URL_LIST}
              className="detailPage"
            />
          </CarouselSection>
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
            <Form onSubmit={onSubmitCommentHandle}>
              <TextareaAutosize
                className="comment"
                rows={1}
                placeholder={loginUser !== 'anonymous' ? '좋은 댓글 부탁드립니다 :)' : '로그인 후 이용 가능합니다.'}
                disabled={loginUser !== 'anonymous' ? false : true}
                onChange={TextAreaChangeHandle}
                value={textAreaValue}
              />
              <CommentInputEnter
                disabled={loginUser !== 'anonymous' ? false : true}
                color={loginUser !== 'anonymous' ? 'var(--white-color-1)' : 'var(--gray-color-2)'}
              >
                입력
              </CommentInputEnter>
            </Form>
            <ReadCommentSection>
              {comment.length === 0 ? (
                <NoneComment>등록된 댓글이 없습니다.</NoneComment>
              ) : (
                comment.map((item, index) => (
                  <CommentProfileSection key={`${item.uid} + ${index}`}>
                    <CommentNickname>{item.nickname}</CommentNickname>
                    <TextareaAutosize
                      className="readComment"
                      rows={1}
                      value={item.comment}
                      disabled={commentDisabled[index]}
                      // ref={(element) => (commentRef.current[index] = element)}
                    />
                    {item.nickname === loginUserNickname.NICKNAME && (
                      <CommentEditDelete>
                        <CommentLink onClick={() => switchCommentDisabledHandle(index)}>수정</CommentLink>
                        <CommentLink onClick={() => DeleteCommentHandle(item)}>삭제</CommentLink>
                      </CommentEditDelete>
                    )}
                  </CommentProfileSection>
                ))
              )}
            </ReadCommentSection>
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

const MoreViewSection = styled.div`
  margin-top: 2rem;
  height: 1rem;
`;

const MoreView = styled.span`
  float: right;
  position: relative;
  border-radius: 100%;
  cursor: pointer;
`;

const CarouselSection = styled.div`
  margin: 0 auto;
  margin-top: 2rem;
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

const Form = styled.form`
  display: flex;
  margin: 2rem 0;
  border: 1px solid var(--gray-color-2);
  border-radius: 0.2rem;
`;

const CommentInputEnter = styled.button<ColorPropsType>`
  flex-grow: 1;
  text-align: center;
  color: var(--gray-color-3);
  border: none;
  background-color: ${(props) => props.color};
  cursor: pointer;
`;

const CommentEditDelete = styled.div`
  display: inline;
  float: right;
`;

const ReadCommentSection = styled.div`
  width: var(--common-post-width);
  min-height: 5rem;
  border-radius: 0.2rem;
  margin-bottom: 2rem;
`;

const NoneComment = styled.p`
  text-align: center;
  margin-top: 2.2rem;
  font-size: 0.8rem;
  color: var(--gray-color-3);
`;

const CommentProfileSection = styled.div`
  display: flex;
  margin-bottom: 1rem;
  font-size: 0.8rem;
`;

const CommentNickname = styled.span`
  border-right: 1px solid var(--gray-color-1);
  margin-top: 0.2rem;
  padding-right: 0.7rem;
`;

const Comment = styled.textarea`
  display: inline;
  padding: 0;
  padding-left: 0.7rem;
  flex-grow: 1;
  border: none;
  background-color: var(--white-color-1);
  font-family: 'Noto Sans KR', sans-serif;
  resize: none;
`;

const CommentLink = styled.span`
  padding: 0 0.2rem;
  font-size: 0.7rem;
  color: var(--gray-color-3);
  cursor: pointer;

  &: hover {
    color: var(--blue-sky-color-2);
  }
`;

const MoreMenuModal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  border: 1px solid var(--gray-color-1);
  border-radius: 0.2rem;
  background-color: var(--white-color-1);
  transform: translateY(0.3rem) translateX(-4.1rem);
  z-index: 99;
`;

const Menu = styled.p`
  flex-grow: 1;
  padding: 0.7rem 1rem;
  width: 3rem;
  border: 1px solid var(--gray-color-1);
  // border-radius: 0.2rem;
  font-size: 0.9rem;
  text-align: center;

  &:hover {
    // background-color: var(--gray-color-2);
    background-color: rgba(217, 217, 212, 0.44);
  }
`;

export default PostDetailPage;
