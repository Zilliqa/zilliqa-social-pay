import React from 'react';
import styled from 'styled-components';

import { Text } from 'src/components/text';
import { Button } from 'src/components/button';
import { Img } from 'src/components/img';

import { FontSize, SizeComponent } from 'src/config';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 40px;
`;
const Flex = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: baseline;

  margin-top: 30px;

  padding-left: 15px;
  padding-right: 15px;

  max-width: 600px;
`;
const TextInfo = styled(Text)`
  max-width: 400px;
`;
const IlluImage = styled(Img)`
  max-height: 400px;
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
      <IlluImage src={imgSrc}/>
      <Flex>
        <TextInfo size={FontSize.sm}>
          {text}
        </TextInfo>
        <Button
          sizeVariant={SizeComponent.md}
          onClick={onNext}
        >
          Next
        </Button>
      </Flex>
    </Container>
  );
}

export default GuideContainer;
