import React from 'react';
import { NextPage } from 'next';
import styled, { createGlobalStyle } from 'styled-components';
import { useRouter } from 'next/router';

import { Carousel } from 'react-responsive-carousel';
import { GuideContainer } from 'components/guide-container';
import { Container } from 'components/container';
import { Button } from 'components/button';
import { Span } from 'components/blue-span';

import { SizeComponent } from 'config';

const CAROUSEL_PROPS = {
  showArrows: false,
  showStatus: false,
  showThumbs: false,
  showIndicators: false,
  emulateTouch: true,
  useKeyboardArrows: true
};
const SLIDES = [
  {
    img: 'guide-1.svg',
    text: (
      <React.Fragment>
        <p>
        SocialPay is an innovative new solution that allows you to earn <Span>$ZIL</Span> by sharing social media updates on Twitter.
        </p>
        <p>
          To use SocialPay you need to login with your Twitter account and use a <Span>#Zilliqa</Span> related hashtag in your tweet.
        </p>
      </React.Fragment>
    )
  },
  {
    img: 'guide-2.svg',
    text: (
      <React.Fragment>
        <p>
          Every time you Tweet a Zilliqa-related message, you are able to earn rewards. These rewards can vary depending on the hashtag and campaign <Span>#Zilliqa</Span> is running.
        </p>
        <p>
          Make sure to always check out what hashtag and campaign is available while you take part in our events!
        </p>
      </React.Fragment>
    )
  }
];

const CarouselStyle = createGlobalStyle`
  .carousel .slide {
    background: transparent;
  }
`;
const CarouselContainer = styled(Container)`
  display: grid;
  justify-content: center;
  align-items: center;
  justify-items: center;
`;

export const GuidePage: NextPage = () => {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = React.useState<number>(0);

  const handeNextSlide = React.useCallback(() => {
    setSelectedItem(selectedItem + 1);
  }, [setSelectedItem, selectedItem]);

  React.useEffect(() => {
    if (selectedItem === SLIDES.length) {
      router.push('/auth');
    }
  }, [selectedItem, SLIDES]);

  return (
    <CarouselContainer>
      <Carousel
        {...CAROUSEL_PROPS}
        selectedItem={selectedItem}
        onChange={setSelectedItem}
      >
        {SLIDES.map((sldie, index) => (
          <GuideContainer
            key={index}
            imgSrc={`/imgs/${sldie.img}`}
            text={sldie.text}
          />
        ))}
      </Carousel>
      <CarouselStyle />
      <Button
        sizeVariant={SizeComponent.lg}
        onClick={handeNextSlide}
      >
        Next
      </Button>
    </CarouselContainer>
  );
};

export default GuidePage;
