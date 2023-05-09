import { doc, getDoc } from 'firebase/firestore/lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../../../firebase';
import Header from '../../components/header/Header';
import Loading from '../../components/Loading';
import { DocumentData } from 'firebase/firestore/lite';

interface PostDataType {
  UID: string;
  NICKNAME: string;
  TITLE: string;
  CONTENT: string;
}

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
        <>
          asdasdasd
          <div>{postData.NICKNAME}</div>
        </>
      )}
    </>
  );
};

export default PostDetailPage;
