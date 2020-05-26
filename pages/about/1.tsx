import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
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
  const browserState = Effector.useStore(BrowserStore.store);

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
              Every time you tweet a SocialPay campaign related message, you can earn rewards. The reward amount will vary depending on the type of campaign <Span>Zilliqa</Span> might be running at a given time.
            </p>
            <p>
              We recommend always checking the details of any on-going campaigns before you tweet.
            </p>
          </DescriptionText>
          <Link href="/auth">
            <Button
              sizeVariant={SizeComponent.lg}
              variant={ButtonVariants.outlet}
            >
              CONTINUE
            </Button>
          </Link>
        </InfoContainer>
        <Illustration src={`/imgs/illustration-5.${browserState.format}`} />
      </AboutContainer>
      <ZilliqaLogo />
    </React.Fragment>
  );
};

export default SecondAboutPage;
