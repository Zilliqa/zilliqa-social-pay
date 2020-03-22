import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { Verified } from 'components/verified';
import { Controller } from 'components/controller';

import { Events } from 'config';
import { PageProp } from 'interfaces';

const MainPageContainer = styled.main`
  display: grid;

  grid-template-rows: max-content;
  grid-template-areas: "header"
                       "container";
`;
const DashboardContainer = styled(Container)`
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-around;
  align-items: end;
  width: 100%;
  max-width: 900px;
`;

const ITERVAL_USER_UPDATE = 90000;

export const MainPage: NextPage<PageProp | any> = ({ user, firstStart }) => {
  const router = useRouter();
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!user && firstStart && !mounted && !userState || Object.keys(userState).length < 1) {
      router.push('/about');
    } else if (!user && !firstStart && !mounted) {
      router.push('/auth');
    } else if (user && !mounted) {
      setMounted(true);
      setInterval(() => UserStore.updateUserState(null), ITERVAL_USER_UPDATE);
    }

    if (!userState || Object.keys(userState).length < 1) {
      router.push('/auth');
    } else if (!userState.updated) {
      UserStore.update();
    } else if (userState.updated && userState.jwtToken && userState.jwtToken.length > 1 && twitterState.tweets.length < 1 && !twitterState.error) {
      EventStore.setEvent(Events.Load);

      BlockchainStore.updateBlockchain(null);

      TwitterStore
        .getTweets(null)
        .then(() => TwitterStore.updateTweets(userState.jwtToken))
        .then(() => EventStore.reset());

      UserStore.updateUserState(null);
    } else if (userState.updated && (!userState.jwtToken || userState.jwtToken.length < 1)) {
      router.push('/auth');
    }
  }, [twitterState, userState, mounted, setMounted, user]);

  return (
    <MainPageContainer>
      <TopBar />
      <DashboardContainer area="container">
        <Verified />
        <Controller />
      </DashboardContainer>
    </MainPageContainer>
  );
};

export default MainPage;
