import styled from '@emotion/styled';
import { DocumentData, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore/lite';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { database } from '../../../firebase';
import Loading from '../../components/Loading';
import ViewMoreIcon from '../../components/ViewMore';
import CarouselComponent from '../../components/carousel/CarouselComponent';
import Footer from '../../components/footer/Footer';
import Header from '../../components/header/Header';
import { uid, userInfo } from '../../store/data';
import { getDate } from '../../store/date';
import { postDetailData } from '../../store/postDetail';

interface ColorPropsType {
  color: string;
}

const PostDetailPage = () => {
  const { postID } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<DocumentData>({});
  const [comment, setComment] = useState<DocumentData[]>([]);
  const [moreMenuStatus, setMoreMenuStatus] = useState<boolean>(false);
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [commentDisabled, setCommentDisabled] = useState<boolean[]>([]);
  const [editComment, setEditComment] = useState<string>('');
  const [likeData, setLikeData] = useState<DocumentData[]>([]);
  const navigate = useNavigate();
  const setRecoilPostData = useSetRecoilState(postDetailData);
  const loginUser = String(useRecoilValue(uid));
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
    console.log(loginUserNickname);
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
      getLike();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getComment = async () => {
    const commentRef = collection(database, 'comments');
    const commentQuery = query(commentRef, where('postID', '==', String(postID)));

    const commentQuerySnapShot = await getDocs(commentQuery);
    const commentData = commentQuerySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
    setComment(commentData);
    const disabledType = new Array(commentData.length);
    disabledType.fill(true);
    setCommentDisabled(disabledType);
  };

  const getLike = async () => {
    const likeRef = collection(database, 'like');
    const likeQuery = query(likeRef, where('postID', '==', String(postID)), where('nickname', '==', loginUserNickname.NICKNAME));

    const likeQuerySnapShot = await getDocs(likeQuery);
    const data = likeQuerySnapShot.docs.map((doc) => ({ ID: doc.id, ...doc.data() }));
    console.log(likeData.length);
    if (data.length > 0) {
      setLikeData(data);
    } else if (likeData.length > 0 && data.length === 0) {
      setLikeData([]);
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

    try {
      await setDoc(doc(database, 'comments', 'post' + getDate() + loginUser), {
        comment: textAreaValue,
        nickname: loginUserNickname.NICKNAME,
        uid: loginUser,
        postID: String(postID),
      });
      getComment();
      setTextAreaValue('');
    } catch (error) {
      alert('댓글 등록을 실패하였습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const DeleteCommentHandle = async (item: DocumentData) => {
    const result = confirm('댓글을 삭제하시겠습니까?');

    if (result) {
      try {
        await deleteDoc(doc(database, 'comments', item.ID));
        getComment();
      } catch (error) {
        alert('댓글 삭제 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
        console.log(error);
      }
    }
    console.log('');
  };

  const switchCommentDisabledHandle = (index: number, mode: string) => {
    const copyCommentDisabled: boolean[] = [];

    if (mode === 'edit') {
      commentDisabled.forEach((element) => {
        copyCommentDisabled.push(element);
      });
      copyCommentDisabled[index] = false;
    } else if (mode === 'cancel') {
      commentDisabled.forEach((element) => {
        copyCommentDisabled.push(element);
      });
      copyCommentDisabled[index] = true;
    }

    setCommentDisabled(copyCommentDisabled);
  };

  const onChangeComment = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditComment(e.target.value);
  };

  const commentEditHandle = async (item: DocumentData) => {
    if (editComment.length === 0) return;

    try {
      const commentRef = doc(database, 'comments', item.ID);

      await updateDoc(commentRef, {
        comment: editComment,
      });
      getComment();
    } catch (error) {
      alert('댓글 수정 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
    }
  };

  const likeHandle = async () => {
    if (likeData.length > 0) {
      try {
        await deleteDoc(doc(database, 'like', likeData[0].ID));
        console.log('asd');
        getLike();
      } catch (error) {
        alert('처리 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
        return;
      }
    } else if (likeData.length === 0) {
      try {
        await setDoc(doc(database, 'like', 'like' + String(postID)), {
          nickname: loginUserNickname.NICKNAME,
          postID: String(postID),
          uid: loginUser,
        });
        getLike();
      } catch (error) {
        alert('처리 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
        return;
      }
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
          <TextareaAutosize
            className="postTextarea"
            rows={1}
            disabled
          >
            {postData.CONTENT}
          </TextareaAutosize>
          <CommentSection>
            <CommentLike>
              <CommentTitle>댓글</CommentTitle>
              <Like onClick={likeHandle}>
                {likeData.length === 0 ? (
                  <svg
                    data-name="Livello 1"
                    id="Livello_1"
                    viewBox="0 0 128 128"
                    xmlns="http://www.w3.org/2000/svg"
                    width={23}
                    height={23}
                  >
                    <title />
                    <path d="M116.22,16.68C108,8.8,95.16,4.88,83.44,6.71,75,8,68.17,12.26,64.07,18.68c-4-6.53-10.62-10.84-18.93-12.22-11.61-1.91-25,2.19-33.37,10.21A38.19,38.19,0,0,0,0,44.05,39.61,39.61,0,0,0,11.74,72.65L59,119.94a7,7,0,0,0,9.94,0l47.29-47.3A39.61,39.61,0,0,0,128,44.05,38.19,38.19,0,0,0,116.22,16.68ZM112,68.4,64.73,115.7a1,1,0,0,1-1.46,0L16,68.4A33.66,33.66,0,0,1,6,44.11,32.23,32.23,0,0,1,15.94,21c5.89-5.67,14.78-9,23.29-9a30.38,30.38,0,0,1,4.94.4c5,.82,11.67,3.32,15.42,10.56A5.06,5.06,0,0,0,64,25.68h0a4.92,4.92,0,0,0,4.34-2.58h0c3.89-7.2,10.82-9.66,15.94-10.46,9.77-1.52,20.9,1.84,27.7,8.37A32.23,32.23,0,0,1,122,44.11,33.66,33.66,0,0,1,112,68.4Z" />
                  </svg>
                ) : (
                  <svg
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 426.668 426.668"
                    xmlSpace="preserve"
                    fill="red"
                    width={23}
                    height={23}
                  >
                    <path
                      d="M401.788,74.476c-63.492-82.432-188.446-33.792-188.446,49.92
	c0-83.712-124.962-132.356-188.463-49.92c-65.63,85.222-0.943,234.509,188.459,320.265
	C402.731,308.985,467.418,159.698,401.788,74.476z"
                    />
                  </svg>
                )}
              </Like>
            </CommentLike>
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
                      defaultValue={item.comment}
                      disabled={commentDisabled[index]}
                      onChange={onChangeComment}
                    />
                    {item.nickname === loginUserNickname.NICKNAME && commentDisabled[index] ? (
                      <CommentEditDelete>
                        <CommentLink onClick={() => switchCommentDisabledHandle(index, 'edit')}>수정</CommentLink>
                        <CommentLink onClick={() => DeleteCommentHandle(item)}>삭제</CommentLink>
                      </CommentEditDelete>
                    ) : (
                      loginUserNickname.NICKNAME !== 'anonymous' && (
                        <CommentEditDelete>
                          <CommentLink onClick={() => commentEditHandle(item)}>수정완료</CommentLink>
                          <CommentLink onClick={() => switchCommentDisabledHandle(index, 'cancel')}>취소</CommentLink>
                        </CommentEditDelete>
                      )
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

const Content = styled.textarea`
  width: inherit;
  padding: 2rem 0;
  border-bottom: 1px solid var(--gray-color-2);
  over
`;

const CommentSection = styled.div`
  margin-top: 2rem;
`;

const CommentLike = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CommentTitle = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
`;

const Like = styled.span`
  cursor: pointer;

  &: hover {
    fill: var(--red-color-1);
  }
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

  &:not(:disabled):hover {
    color: var(--blue-sky-color-1);
  }
`;

const CommentEditDelete = styled.div`
  display: inline;
  float: right;
  margin-top: 0.4rem;
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
  margin-top: 0.35rem;
  padding-top: 0.1rem;
  padding-right: 0.7rem;
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
