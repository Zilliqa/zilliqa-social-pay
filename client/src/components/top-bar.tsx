import styled from 'styled-components';

type Prop = {
  area?: string;
}

export const TopBar = styled.header`
  height: 60px;
  width: 100%;

  background: red;

  ${(props: Prop) => props.area ? `grid-area: ${props.area};` : ''}
`;
