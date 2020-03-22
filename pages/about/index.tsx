import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { Container } from 'components/container';
import { Img } from 'components/img';
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
  flex-wrap: wrap-reverse;
  justify-content: space-evenly;

  background-image: linear-gradient(360deg, rgb(120, 130, 243) 0%, rgb(120, 130, 243) 45%, rgb(120, 130, 243) 81%);
  height: 100vh;
  width: 100vw;
`;
const ZilliqaLogo = styled(Img)`
  position: fixed;
  top: 0px;
  right: 20px;

  width: 70px;
`;
const Illustration = styled(Img)`
  width: 40vw;
  height: auto;

  min-width: 300px;

  @media (max-width: 321px) {
    position: absolute;
    opacity: 0.1;
    z-index: 1;
  }
`;
const InfoContainer = styled.div`
  width: 100%;
  max-width: 390px;

  padding-left: 10px;
  padding-right: 10px;
  z-index: 2;
`;

export const FirstAboutPage: NextPage = () => {
  const router = useRouter();

  const handleNext = React.useCallback(() => {
    router.push(`${router.pathname}/1`);
  }, [router]);

  return (
    <React.Fragment>
      <AboutContainer>
        <Illustration src="/imgs/illustration-1.svg"/>
        <InfoContainer>
          <Text
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProBold}
            css="font-size: 40px;"
          >
            Social Pay.
          </Text>
          <Text
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProDemi}
            size={FontSize.md}
          >
            <p>
              SocialPay is an innovative new solution that allows you to earn <Span>$ZIL</Span> by sharing social media updates on Twitter.
            </p>
            <p>
              To use SocialPay you need to login with your Twitter account and use a <Span>#Zilliqa</Span> related hashtag in your tweet.
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
      <ZilliqaLogo src="/icons/zilliqa-logo.svg" />
    </React.Fragment>
  );
};

export default FirstAboutPage;
