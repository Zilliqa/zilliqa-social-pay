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
            fontVariant={Fonts.AvenirNextLTProDemi}
            size={FontSize.md}
          >
            <p>
            Every time you Tweet a Zilliqa-related message, you are able to earn rewards. These rewards can vary depending on the hashtag and campaign <Span>#Zilliqa</Span> is running.
            </p>
            <p>
            Make sure to always check out what hashtag and campaign is available while you take part in our events!
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
        <Illustration src={`/imgs/illustration-5.${browserState.format}`}/>
      </AboutContainer>
      <ZilliqaLogo />
    </React.Fragment>
  );
};

export default SecondAboutPage;
