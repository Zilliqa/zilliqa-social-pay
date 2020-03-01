import 'react-responsive-carousel/lib/styles/carousel.min.css';

import React from 'react';
import { createGlobalStyle } from 'styled-components'

import { Carousel } from 'react-responsive-carousel';
import { GuideContainer } from 'src/components/guide-container'

const CAROUSEL_PROPS = {
  showArrows: false,
  showStatus: false,
  showThumbs: false,
  showIndicators: false,
  emulateTouch: true
};

const CarouselStyle = createGlobalStyle`
  .carousel .slide {
    background: transparent;
  }
`;

export const Guide: React.FC = () => {
  return (
    <React.Fragment>
      <Carousel {...CAROUSEL_PROPS}>
        <GuideContainer
          imgSrc="/imgs/guide-1.svg"
          text="dasdsadsad"
        />
        <GuideContainer
          imgSrc="/imgs/guide-2.svg"
          text="1321321"
        />
      </Carousel>
      <CarouselStyle />
    </React.Fragment>
  );
}

export default Guide;
