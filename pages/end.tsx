import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';

import { PageProp } from 'interfaces';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  background: linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
  background-repeat: space;

  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const Background = styled(Img)`
  height: auto;
  width: 100%;
  max-width: 1000px;
`;

export const EndPage: NextPage<PageProp> = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 446px)' });

  const browserState = Effector.useStore(BrowserStore.store);

  const backgroundImg = React.useMemo(() => {
    return `imgs/end/3x/asset.${browserState.format}`;
  }, [isTabletOrMobile, browserState]);

  return (
    <EndPageContainer>
      <Background src={backgroundImg} />
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/vdREf5U9_X8"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </EndPageContainer>
  );
};

export default EndPage;
