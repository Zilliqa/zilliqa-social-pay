import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';

import { FontColors } from 'config';
import { PageProp } from 'interfaces';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  background: linear-gradient(61.84deg, #32FFB4 -10.09%, #090424 79.67%);
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

const StakeLink = styled.a`
  position: absolute;
  right: 20px;
  bottom: 20px;

  border-radius: 15px;

  background: ${FontColors.white};
  color: ${FontColors.black};
  font-family: AvenirNextLTPro-Regular;
  font-size: 20px;

  padding: 15px;

  text-decoration: none;

  @media (max-width: 1200px) {
    position: relative;
    right: 0;
    bottom: 0;
  }
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
      <StakeLink href="https://stake.zilliqa.com/">
        Stake your $ZIL now!
      </StakeLink>
    </EndPageContainer>
  );
};

export default EndPage;
