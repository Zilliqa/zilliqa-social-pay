import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';

import BrowserStore from 'store/browser';
import BlockchainStore from 'store/blockchain';

import { Img } from 'components/img';
import { Text } from 'components/text';

import { PageProp } from 'interfaces';
import { FontColors, Fonts } from 'config';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #7882f3;
  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const Background = styled(Img)`
  position: absolute;

  height: auto;
  width: 100%;
  max-width: 900px;
`;
const Asset = styled(Img)`
  position: absolute;
  z-index: 5;
  width: 100%;
`;
const Asset2 = styled(Asset)`
  margin-top: 100px;
  max-width: 300px;
`;
const HashTag = styled(Text)`
  z-index: 1;
  text-shadow: 0 0 0.1em ${FontColors.white};
  font-size: 5vw;

  :first-letter {
    text-transform: uppercase;
  }

  @media (max-width: 1000px) {
    font-size: 10vw;
  }
`;

export const EndPage: NextPage<PageProp> = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 446px)' });

  const browserState = Effector.useStore(BrowserStore.store);
  const BlockchainState = Effector.useStore(BlockchainStore.store);

  const backgroundImg = React.useMemo(() => {
    return `imgs/end/3x/asset.${browserState.format}`;
  }, [isTabletOrMobile, browserState]);

  return (
    <EndPageContainer>
      <Background src={backgroundImg} />
      <HashTag
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        {BlockchainState.hashtag}
      </HashTag>
      <Asset2 src="/imgs/end/svgs/asset_button.svg" />
    </EndPageContainer>
  );
};

export default EndPage;
