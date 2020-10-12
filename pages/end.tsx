import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';

import { FontColors } from 'config';
import { PageProp } from 'interfaces';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  background: linear-gradient(90deg, #13D6A9 0%, #00A5E0 100%);
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
      <Background src={imgURL('bg', browserState.format)} />
      <Background2 src={imgURL('asset', browserState.format)} />
      <Background2 src={imgURL('thanks', browserState.format)} />
      <Background2 src={imgURL('man', browserState.format)} />
      <StakeLink href="https://stake.zilliqa.com/">
        Stake your $ZIL now!
      </StakeLink>
    </EndPageContainer>
  );
};

export default EndPage;
