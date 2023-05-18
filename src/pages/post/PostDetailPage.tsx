import styled from '@emotion/styled';
import { DocumentData, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore/lite';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { getDate, getExpireTime } from '../../store/date';
import { postDetailData } from '../../store/postDetail';
import ReactPaginate from 'react-paginate';
import { useCookies } from 'react-cookie';

interface ColorPropsType {
  color: string;
}

interface SessionPostDataType {
  TITLE: string;
  CONTENT: string;
  IMAGE_NAME_LIST: string[];
  IMAGE_URL_LIST: string[];
  MAIN_ADDRESS: string;
  SECOND_ADDRESS: string;
  DETAIL_ADDRESS: string;
}

const PostDetailPage = () => {
  const { postID } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<DocumentData>({});
  const [comment, setComment] = useState<DocumentData[]>([]);
  const [currentComment, setCurrentComment] = useState<DocumentData>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [createUserProfile, setCreateUserProfile] = useState<string>('');
  const [moreMenuStatus, setMoreMenuStatus] = useState<boolean>(false);
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [commentDisabled, setCommentDisabled] = useState<boolean[]>([]);
  const [editComment, setEditComment] = useState<string>('');
  const [likeData, setLikeData] = useState<DocumentData[]>([]);
  const [likeCount, setLikeCount] = useState<number>();
  const [, setCookie] = useCookies(['uid']);
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
  const itemsPerPage = 5;

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
        const userRef = doc(database, 'users', data.UID);
        const userDocRef = await getDoc(userRef);

        if (userDocRef.exists()) {
          if (userDocRef.data().PROFILE_IMAGE !== '') {
            setCreateUserProfile(userDocRef.data().PROFILE_IMAGE);
          }
        }

        if (data !== undefined) {
          setPostData(data);
          setLikeCount(data.LIKE_COUNT);
          let count = data.INQUIRE_COUNT;
          count++;

          await updateDoc(doc(database, 'posts', filterParams), {
            INQUIRE_COUNT: count,
          });
        }
      }
      getComment();
      getLike();
    } catch (error) {
      console.log(error);
      alert('처리 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
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
    if (loginUser === 'anonymous') {
      navigate('/user/login');
      return;
    }

    if (mode === 'edit') {
      console.log(sessionStorage.getItem('post'));
      if (sessionStorage.getItem('post') === null) {
        const sessionPostData = {
          TITLE: postData.TITLE,
          CONTENT: postData.CONTENT,
          IMAGE_NAME_LIST: postData.IMAGE_NAME_LIST,
          IMAGE_URL_LIST: postData.IMAGE_URL_LIST,
          MAIN_ADDRESS: postData.MAIN_ADDRESS,
          SECOND_ADDRESS: postData.SECOND_ADDRESS,
          DETAIL_ADDRESS: postData.DETAIL_ADDRESS,
        };
        sessionStorage.setItem('post', JSON.stringify(sessionPostData));
      }
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

    if (loginUser === 'anonymous') {
      navigate('/user/login');
      return;
    }

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
    if (loginUser === 'anonymous') {
      navigate('/user/login');
      return;
    }

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
  };

  const switchCommentDisabledHandle = (index: number, mode: string) => {
    if (loginUser === 'anonymous') {
      navigate('/user/login');
      return;
    }

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
    if (loginUser === 'anonymous') {
      navigate('/user/login');
      return;
    }

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
    if (loginUserNickname.NICKNAME === 'anonymous') {
      const result = confirm('로그인 후 이용 가능합니다. 로그인 하시겠습니까?');

      if (result) {
        navigate('/user/login');
      }

      return;
    }

    let getLikeCount = likeCount as number;

    if (likeData.length > 0) {
      try {
        await deleteDoc(doc(database, 'like', likeData[0].ID));

        getLikeCount--;
        await updateDoc(doc(database, 'posts', String(postID)), {
          LIKE_COUNT: getLikeCount,
        });
        setLikeCount(getLikeCount);
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

        getLikeCount++;
        await updateDoc(doc(database, 'posts', String(postID)), {
          LIKE_COUNT: getLikeCount,
        });
        setLikeCount(getLikeCount);
        getLike();
      } catch (error) {
        alert('처리 중 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
        return;
      }
    }
  };

  const setCookieHandle = () => {
    const expireTime = getExpireTime();
    setCookie('uid', loginUser, { path: '/', expires: expireTime });
  };

  useEffect(() => {
    getPost();
  }, []);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentComment(comment.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(comment.length / itemsPerPage));
  }, [comment, itemOffset, itemsPerPage]);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % comment.length;
    setItemOffset(newOffset);
  };

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
              height="30rem"
            />
          </CarouselSection>
          <Title>{postData.TITLE}</Title>
          <Profile>
            <ProfileImage>
              {createUserProfile === '' ? (
                <svg
                  width="60px"
                  height="64px"
                  viewBox="0 0 16 16"
                  fill="gray"
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
                <Image src={createUserProfile} />
              )}
            </ProfileImage>
            {/* <ProfileImage src=""/> */}

            <ProfileInfo>
              <ProfilePharse>작성자 : {postData.NICKNAME}</ProfilePharse>
              <ProfilePharse>작성일 : 2023-05-11</ProfilePharse>
            </ProfileInfo>
          </Profile>
          <AddressSection>
            <div>
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="25px"
                height="25px"
                viewBox="0 0 930.000000 1280.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                <metadata>Created by potrace 1.15, written by Peter Selinger 2001-2017</metadata>
                <g
                  transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
                  fill="var(--red-color-1)"
                  stroke="none"
                >
                  <path
                    d="M4335 12789 c-1496 -104 -2843 -915 -3635 -2190 -232 -373 -414 -787
-529 -1204 -305 -1107 -197 -2278 305 -3295 191 -387 372 -660 676 -1020 34
-41 753 -976 1596 -2077 918 -1199 1555 -2022 1588 -2052 186 -170 442 -170
628 0 33 30 670 853 1588 2052 843 1101 1562 2036 1596 2077 304 360 485 633
676 1020 566 1147 629 2502 174 3695 -353 923 -967 1689 -1798 2242 -825 549
-1864 821 -2865 752z m559 -2254 c224 -29 398 -81 601 -180 553 -268 931 -756
1062 -1374 25 -116 27 -145 28 -366 0 -267 -10 -345 -70 -555 -161 -561 -586
-1032 -1130 -1253 -201 -82 -365 -120 -592 -139 -294 -25 -593 23 -878 139
-544 221 -969 692 -1130 1253 -60 210 -70 288 -70 555 1 221 3 250 28 366 112
527 406 965 842 1252 177 116 437 227 637 271 209 46 467 58 672 31z"
                  />
                </g>
              </svg>
            </div>
            <Address>{postData.MAIN_ADDRESS}</Address>
            <Address>{postData.SECOND_ADDRESS}</Address>
            <Address>{postData.DETAIL_ADDRESS}</Address>
          </AddressSection>

          <TextareaAutosize
            className="postTextarea"
            rows={1}
            disabled
            defaultValue={postData.CONTENT}
          />
          <CountSection>
            <Count>
              조회수 <CountStrong>{postData.INQUIRE_COUNT}</CountStrong>
            </Count>
            <Count>
              좋아요 <CountStrong>{likeCount}</CountStrong>
            </Count>
          </CountSection>
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
                onClick={setCookieHandle}
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
                currentComment.map((item: DocumentData, index: number) => (
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
                      loginUserNickname.NICKNAME !== 'anonymous' &&
                      item.nickname === loginUserNickname.NICKNAME && (
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
            {comment.length > 0 && (
              <PaginationContainer>
                <ReactPaginate
                  previousLabel={'이전'}
                  nextLabel={'다음'}
                  breakLabel={'...'}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={'pagination'}
                  activeClassName={'active'}
                  previousClassName={'pageLabelBtn'}
                  nextClassName={'pageLabelBtn'}
                />
              </PaginationContainer>
            )}
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
  border: 1px solid var(--gray-color-2);
  border-radius: 0.3rem;
`;

const Title = styled.h1`
  margin-top: 2rem;
  font-size: 2rem;
  font-weight: 500;
  word-break: break-all;
`;

const Profile = styled.div`
  margin-top: 2rem;
  display: flex;
`;

const ProfileImage = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
  border: 1px solid var(--gray-color-2);
  text-align: center;
`;

const Image = styled.img`
  width: 4rem;
  height: 4rem;
  border-radius: 100%;
  object-fit: contain;
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

const AddressSection = styled.div`
  display: flex;
  margin-top: 2rem;
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.3rem;
  font-size: 1.1rem;
  font-weight: 500;
`;

const CountSection = styled.div`
  display: flex;
  margin-top: 5rem;
`;

const Count = styled.p`
  color: var(--gray-color-1);
  font-weight: 500;
  font-size: 1rem;

  &:first-of-type {
    margin-right: 1rem;
  }
`;

const CountStrong = styled.span`
  font-weight: 600;
  color: var(--gray-color-3);
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
  border-radius: 0.2rem;
  margin-bottom: 5rem;
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
  // height: 3rem;
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

const PaginationContainer = styled.div`
  width: var(--common-post-width);
  height: 2rem;
  margin-bottom: 3rem;
`;

export default PostDetailPage;
