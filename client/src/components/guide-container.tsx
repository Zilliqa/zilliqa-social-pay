import React from 'react';

import { Container } from 'src/components/container';
import { Text } from 'src/components/text';
import { Button } from 'src/components/button';

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
      <img
        src={imgSrc}
        alt="ilus"
        height="100"
      />
      <Text>
        {text}
      </Text>
      <Button onClick={onNext}>
        Next
      </Button>
    </Container>
  );
}

export default GuideContainer;
