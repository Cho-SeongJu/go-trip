import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { uid } from '../../../store/data';
import TripPost from './TripPost';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore/lite';
import { database } from '../../../../firebase';
import Loading from '../../Loading';

const TripContent = () => {
  const userAuth = useRecoilValue(uid);
  const navigate = useNavigate();

  const searchConditionArr = ['글제목', '작성자'];

  const CheckAuth = () => {
    if (userAuth === 'anonymous') {
      navigate('/user/login');
    } else {
      navigate('/writePost');
    }
  };

  return (
    <>
      <Section>
        <FilterSection>
          <SelectBoxSection>
            <SearchCondition>
              <SearchPharse>글제목</SearchPharse>
              <DropDownSection></DropDownSection>
            </SearchCondition>
            <ConditionList>
              {searchConditionArr.map((item, index) => (
                <ConditionListItem key={index}>{item}</ConditionListItem>
              ))}
            </ConditionList>
          </SelectBoxSection>
          <SearchKeywordSection>
            <SearchKeyword type="text" />
          </SearchKeywordSection>
          <WritePost onClick={CheckAuth}>글쓰기</WritePost>
        </FilterSection>
        <TripPost />
      </Section>
    </>
  );
};

const Section = styled.div`
  margin: var(--common-margin);
  width: var(--common-width);
  min-height: calc(100vh - 10rem - 3.2rem - 79.981px);
`;

const FilterSection = styled.div`
  display: flex;
`;

const SelectBoxSection = styled.div`
  width: 10rem;
  height: 3rem;
`;

const SearchCondition = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 2rem;
  border: 1px solid black;
`;

const SearchPharse = styled.p`
  width: 5rem;
`;

const DropDownSection = styled.div`
  width: 3rem;
  height: 2rem;
  border: 1px solid black;
`;

const ConditionList = styled.ul`
  display: none;
`;

const ConditionListItem = styled.li``;

const SearchKeywordSection = styled.div``;

const SearchKeyword = styled.input``;

const WritePost = styled.button`
  width: 5rem;
  height: 1.5rem;
  background-color: var(--blue-sky-color-1);
  color: var(--white-color-1);
`;

export default TripContent;
