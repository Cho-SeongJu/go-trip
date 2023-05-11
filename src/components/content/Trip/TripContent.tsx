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
              <Selectbox name="searchType">
                {searchConditionArr.map((item, index) => (
                  <option
                    value={item}
                    key={index}
                  >
                    {item}
                  </option>
                ))}
              </Selectbox>
            </SelectBoxSection>
            <SearchKeywordSection>
              <SearchKeyword type="text" />
              <SearchIcon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0,0,256,256"
                  width="20px"
                  height="20px"
                  fillRule="nonzero"
                >
                  <g
                    fillOpacity="0.4"
                    fill="#000000"
                    fillRule="nonzero"
                    stroke="none"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDasharray=""
                    strokeDashoffset="0"
                    fontFamily="none"
                    fontWeight="none"
                    fontSize="none"
                    textAnchor="none"
                  >
                    <g transform="scale(5.12,5.12)">
                      <path d="M21,3c-9.39844,0 -17,7.60156 -17,17c0,9.39844 7.60156,17 17,17c3.35547,0 6.46094,-0.98437 9.09375,-2.65625l12.28125,12.28125l4.25,-4.25l-12.125,-12.09375c2.17969,-2.85937 3.5,-6.40234 3.5,-10.28125c0,-9.39844 -7.60156,-17 -17,-17zM21,7c7.19922,0 13,5.80078 13,13c0,7.19922 -5.80078,13 -13,13c-7.19922,0 -13,-5.80078 -13,-13c0,-7.19922 5.80078,-13 13,-13z"></path>
                    </g>
                  </g>
                </svg>
              </SearchIcon>
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
  width: inherit;
`;

const SelectBoxSection = styled.div`
  margin: auto 0;
`;

const Sort = styled.div`
  display: flex;
  float: right;
  margin-top: 2rem;
  margin-bottom: 3rem;
`;

const Selectbox = styled.select`
  padding: 0.8rem;
  font-size: 0.8rem;
  border: 1px solid var(--gray-color-1);
  outline: none;

  background-color: #fff;
`;

// const SearchCondition = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   width: 5rem;
//   height: 2rem;
//   border: 1px solid black;
// `;

// const SearchPharse = styled.p`
//   width: 5rem;
// `;

// const DropDown = styled.div`
//   width: 3rem;
//   height: 2rem;
//   border: 1px solid black;
// `;

// const ConditionList = styled.ul`
//   display: none;
// `;

// const ConditionListItem = styled.li``;

const SearchKeywordSection = styled.div`
  display: flex;
  margin: auto 0.3rem;
  border: 1px solid var(--gray-color-1);
`;

const SearchKeyword = styled.input`
  padding: 0.8rem;
  outline: none;
  border: none;
  width: 13rem;
`;

const SearchIcon = styled.span`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
`;

// const WritePostSection = styled.div`
//   display: flex;
//   border-radius: 0.2rem;
//   color: var(--white-color-1);
//   background-color: var(--blue-sky-color-1);
//   cursor: pointer;
// `;

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

// const DropDownIcon = styled.div`
//   display: flex;
//   align-items: center;
//   margin-right: 0.7rem;
// `;

export default TripContent;
