import styled from 'styled-components';

type Prop = {
  area?: string;
}

export const LeftBar = styled.header`
  height: 100%;
  width: 150px;

  background: blue;

  ${(props: Prop) => props.area ? `grid-area: ${props.area};` : ''}
`;
