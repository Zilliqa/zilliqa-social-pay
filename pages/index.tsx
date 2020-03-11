import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { TwitterTweetEmbed, TwitterHashtagButton } from 'react-twitter-embed';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { LeftBar } from 'components/left-bar';
import { Text } from 'components/text';
import { Card } from 'components/card';

import { fromZil } from 'utils/from-zil';
import { Events, FontSize, Fonts } from 'config';

const LINKS = [
  {
    img: '/icons/twitter.svg',
    name: 'Twittes',
    event: Events.Twitter
  },
  {
    img: '/icons/setup.svg',
    name: 'Settings',
    event: Events.Settings
  }
];

const MainPageContainer = styled.main`
  display: grid;

  grid-template-columns: max-content;
  grid-template-rows: max-content;
  grid-template-areas: "left-bar header"
                       "left-bar container";
`;
const OverviewContainer = styled(Container)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 15px;
  justify-content: space-between;
  align-items: center;
`;
const TweetContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
`;

export const MainPage: NextPage = () => {
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [mounted, setMounted] = React.useState(false);

  const overviews = React.useMemo(() => [
    {
      title: 'Block per day.',
      value: blockchainState.blocksPerDay
    },
    {
      title: 'Block per week.',
      value: blockchainState.blocksPerWeek
    },
    {
      title: 'ZILs per tweet.',
      value: fromZil(blockchainState.zilsPerTweet, false)
    },
    {
      title: 'Current DSEpoch.',
      value: blockchainState.CurrentDSEpoch || 0
    }
  ], [blockchainState]);

  React.useEffect(() => {
    if (twitterState.tweets.length < 1 && !twitterState.error) {
      UserStore.update();
      TwitterStore.getTweets(null);
    }

    if (!mounted) {
      BlockchainStore.updateBlockchain(null);
      setMounted(true);
    }
  }, [twitterState, userState, mounted, setMounted]);

  return (
    <MainPageContainer>
      <LeftBar
        items={LINKS}
        profileName={userState.screenName}
      />
      <TopBar
        zilAddress={userState.zilAddress}
        profileImg={userState.profileImageUrl}
        profileName={userState.screenName}
      />
      <Container area="container">
        <Text upperCase>
            Overview
        </Text>
        <OverviewContainer>
          {overviews.map((overflow, index) => (
            <Card
              title={overflow.title}
              key={index}
            >
              {overflow.value}
            </Card>
          ))}
        </OverviewContainer>
        <TweetContainer>
          <Text upperCase>
            Verified tweetes
          </Text>
          <TwitterHashtagButton
            tag={blockchainState.hashtag}
            options={{
              size: 'large',
              screenName: userState.screenName,
              buttonHashtag: null
            }}
          />
        </TweetContainer>
        {twitterState.tweets.map((tweet, index) => (
          <TwitterTweetEmbed
            key={index}
            screenName={userState.screenName}
            tweetId={tweet.id_str}
          />
        ))}
        {twitterState.tweets.length < 1 ? (
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProBold}
          >
            You haven't verified tweets yet.
          </Text>
        ) : null}
      </Container>
    </MainPageContainer>
  );
};

export default MainPage;
