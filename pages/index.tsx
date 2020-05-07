import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useRouter, NextRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import BrowserStore from 'store/browser';
import NotificationStore from 'store/notification';

import { Container } from 'components/container';
import { Img } from 'components/img';
import { NotificationSuccess } from 'components/notification-control';
import { CountdownBar } from 'components/countdown-bar';

import { socket } from 'utils/socket';
import { PageProp } from 'interfaces';
import { Events } from 'config';
import ERROR_CODES from 'config/error-codes';

const TopBar = dynamic(() => import('components/top-bar'));
const Verified = dynamic(() => import('components/verified'));
const Controller = dynamic(() => import('components/controller'));

const MainPageContainer = styled.main`
  display: grid;

  grid-template-rows: max-content max-content 1fr;
  grid-template-areas: "countdown-bar"
                       "header"
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
`;
const Illustration = styled(Img)`
  position: fixed;
  right: 0;
  bottom: 0;

  max-width: 50vh;
  height: auto;
  z-index: 0;
`;

const updater = async (router: NextRouter) => {
  const tweetsResult = await TwitterStore.getTweets({});
  const user = await UserStore.updateUserState(null);
  const blockchain = await BlockchainStore.updateBlockchain(null);
  const campaignEnd = new Date((blockchain.campaignEnd as any)).valueOf();
  const now = new Date((blockchain.now as any)).valueOf();
  const diff = campaignEnd - now;

  if (diff <= 0) {
    router.push('/end');

    return null;
  }

  if (tweetsResult && tweetsResult.code === ERROR_CODES.unauthorized) {
    throw new Error(tweetsResult.message);
  } else if (user && user.code === ERROR_CODES.unauthorized) {
    throw new Error(tweetsResult.message);
  } else if (blockchain && blockchain.code === ERROR_CODES.unauthorized) {
    throw new Error(tweetsResult.message);
  } else if (!tweetsResult.tweets || tweetsResult.tweets.length < 1) {
    const userState = UserStore.store.getState();

    const result = await TwitterStore.updateTweets(userState.jwtToken);

    if (Array.isArray(result.tweets)) {
      NotificationStore.addNotifly(
        <NotificationSuccess>
          <Img
            src="/icons/ok.svg"
            css="margin-right: 10px;"
          />
        SocialPay has found {result.tweets.length} tweets.
      </NotificationSuccess>
      );
    }
  }

  await NotificationStore.getNotifications({});
};

export const MainPage: NextPage<PageProp> = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 446px)' });
  const router = useRouter();

  const userState = Effector.useStore(UserStore.store);
  const browserState = Effector.useStore(BrowserStore.store);

  const [mounted, setMounted] = React.useState(false);

  /**
   * Effect for fetch data from server.
   */
  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
      EventStore.setEvent(Events.Load);

      updater(router)
        .then(() => {
          socket();
          EventStore.reset();
        })
        .catch(() => {
          EventStore.reset();
          EventStore.signOut(null);
          UserStore.clear();

          router.push('/about');
        });
    }
  }, [
    mounted,
    setMounted,
    userState
  ]);

  return (
    <MainPageContainer>
      <CountdownBar />
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
