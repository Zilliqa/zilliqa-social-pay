import React from 'react';
import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  width: number | string;
  height: number | string;
};
const Container = styled.div`
  display: flex;
`;
const Line0 = styled.div`
  width: ${(props: Prop) => props.width}px;
  height: ${(props: Prop) => props.height}px;
  transform: translate(-200%, 0px) rotate(-40deg);
  background-color: ${FontColors.white};
`;
const Line1 = styled.div`
  width: ${(props: Prop) => props.width}px;
  height: ${(props: Prop) => props.height}px;
  transform: translate(0,0) rotate(40deg);
  background-color: ${FontColors.white};
`;

export const Arrow: React.FC<Prop> = (props) => (
  <Container>
    <Line0 {...props} />
    <Line1 {...props} />
  </Container>
);
