import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
// import { TwitterTweetEmbed, TwitterHashtagButton } from 'react-twitter-embed';

import UserStore from 'store/user';
// import TwitterStore from 'store/twitter';
// import BlockchainStore from 'store/blockchain';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { Verified } from 'components/verified';
import { Controller } from 'components/controller';

// import { fromZil } from 'utils/from-zil';
// import { Events, FontSize, Fonts } from 'config';

const MainPageContainer = styled.main`
  display: grid;

  grid-template-rows: max-content;
  grid-template-areas: "header"
                       "container";
`;
const DashboardContainer = styled(Container)`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: end;
  width: 100%;
`;

export const MainPage: NextPage = () => {
  const userState = Effector.useStore(UserStore.store);
  // const twitterState = Effector.useStore(TwitterStore.store);
  // const blockchainState = Effector.useStore(BlockchainStore.store);

  return (
    <MainPageContainer>
      <TopBar
        zilAddress={userState.zilAddress}
        profileImg={userState.profileImageUrl}
        profileName={userState.screenName}
      />
      <DashboardContainer area="container">
        <Controller />
        <Verified />
      </DashboardContainer>
    </MainPageContainer>
  );
};

export default MainPage;
