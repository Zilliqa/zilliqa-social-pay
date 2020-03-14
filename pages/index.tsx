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
import { Verified } from 'components/verified';
import { Controller } from 'components/controller';

import { Events } from 'config';

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

export const MainPage: NextPage = () => {
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!mounted && twitterState.tweets.length < 1 && !twitterState.error) {
      UserStore.update();

      if (userState.jwtToken && userState.jwtToken.length > 1) {
        EventStore.setEvent(Events.Load);

        BlockchainStore.updateBlockchain(null);

        TwitterStore
          .getTweets(null)
          .then(() => TwitterStore.updateTweets(userState.jwtToken))
          .then(() => EventStore.reset());

        setMounted(true);
      }

      UserStore.updateUserState(null);

      setInterval(() => UserStore.updateUserState(null), ITERVAL_USER_UPDATE);
    }
  }, [twitterState, userState, mounted, setMounted]);

  return (
    <MainPageContainer>
      <TopBar
        zilAddress={userState.zilAddress}
        profileImg={userState.profileImageUrl}
        profileName={userState.screenName}
      />
      <DashboardContainer area="container">
        <Verified />
        <Controller />
      </DashboardContainer>
    </MainPageContainer>
  );
};

export default MainPage;
