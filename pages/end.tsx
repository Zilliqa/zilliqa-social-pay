import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';

import { FontColors, Fonts } from 'config';
import { PageProp } from 'interfaces';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  background: #001623;
  background-repeat: space;

  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const Background = styled(Img)`
  position: absolute;

  height: auto;
  width: 100%;
`;
const Background2 = styled(Background)`
  max-width: 1500px;
`;

const StakeLink = styled.a`
  position: absolute;
  right: 20px;
  bottom: 20px;

  border-radius: 40px;

  background: ${FontColors.white};
  color: #00A5E0;
  font-family: ${Fonts.AvenirNextLTProDemi};
  font-size: 30px;

  padding: 15px;
  padding-left: 30px;
  padding-right: 30px;

  text-decoration: none;

  @media (max-width: 1200px) {
    position: relative;
    right: 0;
    bottom: 0;
    margin-top: 60%;
  }
`;

function imgURL(name: string, format: string) {
  return `imgs/end/3x/${name}.${format}`;
}

export const EndPage: NextPage<PageProp> = () => {
  const browserState = Effector.useStore(BrowserStore.store);

  return (
    <EndPageContainer>
      <Background2
        src={imgURL('asset', browserState.format)}
        css="margin-top: 1%;"
      />
      <Background2 src={imgURL('hashtag', 'svg')} />
      <StakeLink href="https://stake.zilliqa.com/">
        Stake your $ZIL now!
      </StakeLink>
    </EndPageContainer>
  );
};

export default EndPage;
