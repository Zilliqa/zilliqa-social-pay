import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import * as Effector from 'effector-react';

import BrowserStore from 'store/browser';

import { Span } from 'components/blue-span';
import { Button } from 'components/button';
import {
  AboutContainer,
  InfoContainer,
  ZilliqaLogo,
  Illustration,
  DescriptionText
} from 'components/about-page-container';

import {
  FontColors,
  Fonts,
  FontSize,
  ButtonVariants,
  SizeComponent
} from 'config';

export const SecondAboutPage: NextPage = () => {
  const router = useRouter();

  const browserState = Effector.useStore(BrowserStore.store);

  const handleNext = React.useCallback(() => {
    router.push('/auth');
  }, [router]);

  return (
    <React.Fragment>
      <AboutContainer css="flex-wrap: wrap-reverse;">
        <InfoContainer>
          <DescriptionText
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProRegular}
            size={FontSize.md}
          >
            <p>
              Every time you tweet a SocialPay-related message, you can earn rewards. These reward amounts will vary depending on the campaign that Zilliqa might be running at any given time.
            </p>
            <p>
              We recommend to always check the details of any on-going campaigns before you tweet.
            </p>
          </DescriptionText>
          <Button
            sizeVariant={SizeComponent.lg}
            variant={ButtonVariants.outlet}
            onClick={handleNext}
          >
            CONTINUE
          </Button>
        </InfoContainer>
        <Illustration src={`/imgs/illustration-5.${browserState.format}`} />
      </AboutContainer>
      <ZilliqaLogo />
    </React.Fragment>
  );
};

export default SecondAboutPage;
