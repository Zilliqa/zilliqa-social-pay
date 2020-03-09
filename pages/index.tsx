import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { TwitterTweetEmbed, TwitterHashtagButton } from 'react-twitter-embed';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { LeftBar } from 'components/left-bar';
import { Text } from 'components/text';
import { Card } from 'components/card';

import { PageProp } from 'interfaces';
import { fromZil } from 'utils/from-zil';
import { Events } from 'config';

const LINKS = [
  {
    img: '/icons/twitter.svg',
    name: 'Twittes',
    event: Events.None
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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const TweetContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
`;

export const MainPage: React.FC<PageProp> = ({ ...pageProps }) => {
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);

  const overviews = React.useMemo(() => {
    return [
      {
        title: 'Block per day.',
        value: pageProps.contract.blocksPerDay
      },
      {
        title: 'Block per week.',
        value: pageProps.contract.blocksPerWeek
      },
      {
        title: 'ZILs per tweet.',
        value: fromZil(pageProps.contract.zilsPerTweet, false)
      },
      {
        title: 'Current DSEpoch.',
        value: pageProps.blockchain.CurrentDSEpoch
      }
    ];
  }, [pageProps.contract]);

  React.useEffect(() => {
    if (twitterState.tweets.length < 1 && !twitterState.error) {
      UserStore.update();
      TwitterStore.getTweets(null);
    }

    if (userState.jwtToken && twitterState.error) {
      TwitterStore.updateTweets(userState.jwtToken);
    }
  }, [twitterState, userState]);

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
            Tweetes
          </Text>
          <TwitterHashtagButton
            tag={pageProps.contract.hashtag}
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
      </Container>
    </MainPageContainer>
  );
};

export default MainPage;
