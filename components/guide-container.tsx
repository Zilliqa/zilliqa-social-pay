import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';
import { Img } from 'components/img';

import { FontSize } from 'config';

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
  text: string | JSX.Element;
};

export const GuideContainer: React.FC<Prop> = ({
  imgSrc,
  text
}) => {
  return (
    <Container>
      <IlluImage src={imgSrc}/>
      <Flex>
        <TextInfo size={FontSize.sm}>
          {text}
        </TextInfo>
      </Flex>
    </Container>
  );
};

export default GuideContainer;
