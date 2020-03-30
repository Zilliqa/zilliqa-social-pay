import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useRouter } from 'next/router';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { Img } from 'components/img';
import { Verified } from 'components/verified';
import { Controller } from 'components/controller';

import { socket } from 'utils/socket';
import { PageProp } from 'interfaces';
import { Events } from 'config';

const MainPageContainer = styled.main`
  display: grid;

  grid-template-rows: max-content;
  grid-template-areas: "header"
                       "container";

  background: #7882f3;
  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const DashboardContainer = styled(Container)`
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  max-width: 900px;
  z-index: 1;

  padding-top: 5%;
`;
const Illustration = styled(Img)`
  position: absolute;
  right: 0;
  bottom:  0;

  max-width: 30vw;
  height: auto;
  z-index: 0;
`;

const updater = async () => {
  const messageError = 'Unauthorized';
  const user = await UserStore.updateUserState(null);

  if (user && user.message && user.message === messageError) {
    throw new Error(messageError);
  }

  const blockchain = await BlockchainStore.updateBlockchain(null);

  if (blockchain && blockchain.message && blockchain.message === messageError) {
    throw new Error(messageError);
  }

  const tweets = await TwitterStore.getTweets(null);

  if (tweets.message && tweets.message === messageError) {
    throw new Error(messageError);
  }
};

export const MainPage: NextPage<PageProp> = () => {
  const router = useRouter();

  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);

      EventStore.setEvent(Events.Load);

      updater()
        .then(() => {
          socket();
          EventStore.reset();
        })
        .catch(() => {
          EventStore.reset();
          router.push('/auth');
        });
    }
  }, [
    mounted,
    setMounted,
    blockchainState,
    userState,
    router
  ]);

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
