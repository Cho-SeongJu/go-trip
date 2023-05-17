import { useEffect } from 'react';
import { areaCondition } from '../store/area';
import styled from '@emotion/styled';

interface PropsType {
  selectedArea: string;
  setSelectedArea: React.Dispatch<React.SetStateAction<string>>;
}

const Area = (props: PropsType) => {
  const { selectedArea, setSelectedArea } = props;

  useEffect(() => {
    setSelectedArea(areaCondition[0]);
  }, []);

  const onClickHandle = (element: string) => {
    setSelectedArea(element);
  };

  return (
    <>
      <Section>
        {areaCondition.map((element) => (
          <Item
            key={element}
            role="button"
            className={element === selectedArea ? 'selected' : ''}
            onClick={() => onClickHandle(element)}
          >
            {element}
          </Item>
        ))}
      </Section>
    </>
  );
};

const Section = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin: auto 0;
  margin-right: 4rem;
  width: 20rem;
  height: 6.5rem;
`;

const Item = styled.div`
  margin: auto;
  padding: 0.55rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid var(--gray-color-2);
  font-size: 0.8rem;

  transition: background-color 0.05s ease-in-out;

  &:hover {
    background-color: var(--blue-sky-color-1);
    color: white;
  }

  &.selected {
    background-color: var(--blue-sky-color-1);
    color: white;
  }
`;
export default Area;
