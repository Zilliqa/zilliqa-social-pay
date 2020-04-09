import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import BrowserStore from 'store/browser';

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
  max-width: 1024px;
  max-hight: 100vh;
  z-index: 1;

  padding-top: 5%;
`;
const Illustration = styled(Img)`
  position: fixed;
  right: 0;
  bottom: 0;

  max-width: 50vh;
  height: auto;
  z-index: 0;
`;

const updater = async () => {
  const messageError = 'Unauthorized';
  let userState = UserStore.store.getState();
  const blockchain = await BlockchainStore.updateBlockchain(null);

  if (Number(userState.balance) === 0) {
    const user = await UserStore.updateUserState(null);

    if (user && user.message && user.message === messageError) {
      throw new Error(messageError);
    }
  }

  if (blockchain && blockchain.message && blockchain.message === messageError) {
    throw new Error(messageError);
  }

  const tweetsResult = await TwitterStore.getTweets({});

  if (tweetsResult.message && tweetsResult.message === messageError) {
    throw new Error(messageError);
  } else if (!tweetsResult.tweets || tweetsResult.tweets.length < 1) {
    userState = UserStore.store.getState();

    await TwitterStore.updateTweets(userState.jwtToken);
  }
};

export const MainPage: NextPage<PageProp> = (props) => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 446px)' });
  const router = useRouter();

  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);
  const browserState = Effector.useStore(BrowserStore.store);

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
          EventStore.signOut(null);

          if (props.firstStart) {
            router.push('/about');

            return null;
          }

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
      {!isTabletOrMobile ? (
        <Illustration src={`/imgs/illustration-4.${browserState.format}`} />
      ) : null}
    </MainPageContainer>
  );
};

export default MainPage;
