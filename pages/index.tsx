import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { Img } from 'components/img';
import { Verified } from 'components/verified';
import { Controller } from 'components/controller';

// import { Events } from 'config';
import { PageProp } from 'interfaces';

const MainPageContainer = styled.main`
  display: grid;

  grid-template-rows: max-content;
  grid-template-areas: "header"
                       "container";

  background: #E0E4FF;
  width: 100%;
  height: 100vh;
`;
const DashboardContainer = styled(Container)`
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-around;
  align-items: end;
  width: 100%;
  max-width: 900px;
  z-index: 1;
`;
const Illustration = styled(Img)`
  position: absolute;
  right: 0;
  bottom:  0;

  max-width: 30vw;
  height: auto;
  z-index: 0;
`;

const ITERVAL_USER_UPDATE = 10000;
const COEFFICIENT = 1.5;

function updater(rate: number) {
  UserStore.updateUserState(null);
  BlockchainStore.updateBlockchain(null);
  TwitterStore
    .getTweets(null)
    .then(() => EventStore.reset());

  setInterval(() => {
    UserStore.updateUserState(null);
    BlockchainStore.updateBlockchain(null);
    TwitterStore.getTweets(null)
  }, ITERVAL_USER_UPDATE);

  setInterval(() => BlockchainStore.nextBlock(), rate * COEFFICIENT);
}

export const MainPage: NextPage<PageProp> = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);

      updater(Number(blockchainState.rate));
    }
  }, [mounted, setMounted, blockchainState]);

  return (
    <MainPageContainer>
      <TopBar />
      <DashboardContainer area="container">
        <Verified />
        <Controller />
      </DashboardContainer>
      <Illustration src="/imgs/illustration-4.svg"/>
    </MainPageContainer>
  );
};

export default MainPage;
