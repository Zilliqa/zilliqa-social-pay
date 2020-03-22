import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { Container } from 'components/container';
import { Text } from 'components/text';
import { Span } from 'components/blue-span';
import { Button } from 'components/button';

import {
  FontColors,
  Fonts,
  FontSize,
  SizeComponent
} from 'config';

const AboutContainer = styled(Container)`
  display: flex;
  align-items: center;

  background:
    url(/imgs/illustration-2.svg),
    linear-gradient(90deg, rgb(22, 25, 64) 46%, rgb(22, 25, 64) 83%, rgb(83, 82, 238) 100%);
  background-size: contain;
  background-repeat-y: no-repeat;

  height: 100vh;
  width: 100vw;
`;
const InfoContainer = styled.div`
  width: 100%;
  max-width: 460px;

  padding-left: 10px;
  padding-right: 10px;
  margin-left: 10%;

  @media (max-width: 400px) {
    margin: 0;
  }
`;

export const SecondAboutPage: NextPage = () => {
  const router = useRouter();

  const handleNext = React.useCallback(() => {
    router.push('/auth');
  }, [router]);

  return (
    <React.Fragment>
      <AboutContainer>
        <InfoContainer>
          <Text
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProDemi}
            size={FontSize.md}
          >
            <p>
            Every time you Tweet a Zilliqa-related message, you are able to earn rewards. These rewards can vary depending on the hashtag and campaign <Span>#Zilliqa</Span> is running.
            </p>
            <p>
            Make sure to always check out what hashtag and campaign is available while you take part in our events!
            </p>
          </Text>
          <Button
            sizeVariant={SizeComponent.lg}
            onClick={handleNext}
          >
            NEXT
          </Button>
        </InfoContainer>
      </AboutContainer>
    </React.Fragment>
  );
};

export default SecondAboutPage;
