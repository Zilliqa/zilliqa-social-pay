import React from 'react';
import styled from 'styled-components';

import { Text } from 'src/components/text';
import { Button } from 'src/components/button';
import { Img } from 'src/components/img';

const Container = styled.div`
  margin-top: 40px;
`;
const Flex = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;

  margin-top: 30px;
`;

type Prop = {
  imgSrc: string;
  text: string;
  onNext?: () => void;
}

export const GuideContainer: React.FC<Prop> = ({
  imgSrc,
  text,
  onNext
}) => {
  return (
    <Container>
      <Img src={imgSrc} />
      <Flex>
        <Text>
          {text}
        </Text>
        <Button onClick={onNext}>
          Next
        </Button>
      </Flex>
    </Container>
  );
}

export default GuideContainer;
