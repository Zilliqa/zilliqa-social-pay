import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Span } from 'components/blue-span';
import { Button } from 'components/button';
import {
  AboutContainer,
  InfoContainer,
  ZilliqaLogo,
  TitleText,
  DescriptionText,
  Illustration
} from 'components/about-page-container';

import {
  FontColors,
  Fonts,
  FontSize,
  SizeComponent,
  ButtonVariants
} from 'config';

export const FirstAboutPage: NextPage = () => {
  const router = useRouter();

  const handleNext = React.useCallback(() => {
    router.push(`${router.pathname}/1`);
  }, [router]);

  return (
    <React.Fragment>
      <AboutContainer>
        <Illustration src="/imgs/illustration-1.webp"/>
        <InfoContainer>
          <TitleText
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProBold}
          >
            SocialPay.
          </TitleText>
          <DescriptionText
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
          </DescriptionText>
          <Button
            sizeVariant={SizeComponent.lg}
            variant={ButtonVariants.outlet}
            onClick={handleNext}
          >
            NEXT
          </Button>
        </InfoContainer>
      </AboutContainer>
      <ZilliqaLogo />
    </React.Fragment>
  );
};

export default FirstAboutPage;
