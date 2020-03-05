import styled from 'styled-components';

type Prop = {
  area?: string;
}

export const Container = styled.div`
  max-width: 100vw;

  margin-right: auto;
  margin-left:  auto;

  ${(props: Prop) => props.area ? `grid-area: ${props.area};` : ''}
`;
