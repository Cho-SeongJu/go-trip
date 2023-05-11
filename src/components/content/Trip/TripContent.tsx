import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { uid } from '../../../store/data';
import TripPost from './TripPost';

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
          <Sort>
            <SelectBoxSection>
              <SearchCondition>
                <SearchPharse>글제목</SearchPharse>
                <DropDown>
                  <svg
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 517.8 306.6"
                    width={15}
                    xmlSpace="preserve"
                    fill="var(--black-color-1)"
                  >
                    <g>
                      <path
                        d="M258.9,306.6l-249-249C-3.3,44.5-3.3,23.1,9.9,9.9c13.2-13.2,34.6-13.2,47.8,0l201.2,201.2L460.1,9.9
		c13.2-13.2,34.6-13.2,47.8,0c13.2,13.2,13.2,34.6,0,47.8L258.9,306.6z"
                      />
                    </g>
                  </svg>
                </DropDown>
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
            <WritePostButton onClick={CheckAuth}>글쓰기</WritePostButton>
          </Sort>
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
  margin-top: 2rem;
  width: inherit;
`;

const SelectBoxSection = styled.div`
  width: 5rem;
`;

const Sort = styled.div`
  display: flex;
  float: right;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
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

const DropDown = styled.div`
  width: 3rem;
  height: 2rem;
  border: 1px solid black;
`;

const ConditionList = styled.ul`
  display: none;
`;

const ConditionListItem = styled.li``;

const SearchKeywordSection = styled.div`
  margin: auto 1rem;
`;

const SearchKeyword = styled.input`
  padding: 0.5rem;
`;

const WritePostSection = styled.div`
  display: flex;
  border-radius: 0.2rem;
  color: var(--white-color-1);
  background-color: var(--blue-sky-color-1);
  cursor: pointer;
`;

const WritePostButton = styled.button`
  margin-left: 3rem;
  padding: 0.7rem 1rem;
  background-color: var(--blue-sky-color-1);
  color: var(--white-color-1);
  border: none;
  border-radius: 0.2rem;
  cursor: pointer;

  &: hover {
    opacity: 0.8;
  }
`;

const DropDownIcon = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.7rem;
`;

export default TripContent;
