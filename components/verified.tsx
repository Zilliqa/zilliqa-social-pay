import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';

import { Text } from 'components/text';
import { MiniLoader } from 'components/min-loader';
import { Img } from 'components/img';
import { Container } from 'components/container';
import { TwitterHashtagButton, TwitterTweetEmbed } from 'react-twitter-embed';

import { FontSize, Fonts, FontColors } from 'config';
import { viewTx } from 'utils/viewblock';

const HaventVerified = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
`;
const TweetEmbedContainer = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 40px 1fr;
`;

const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;

/**
 * Show user tweets.
 */
export const Verified: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);

  /**
   * Hash tag from smart contract.
   */
  const hashTag = React.useMemo(() => {
    if (!blockchainState.hashtag) {
      return '';
    }

    const splited = blockchainState.hashtag.split('');

    splited[1] = splited[1].toUpperCase();

    return splited.join('');
  }, [blockchainState]);
  /**
   * If user have not any tweets.
   */
  const nonTweets = React.useMemo(() => {
    if (!twitterState.tweets || twitterState.tweets.length === 0) {
      return 'display: block;';
    }

    return 'display: none;';
  }, [twitterState]);

  return (
    <Container>
      <Container css={nonTweets}>
        <HaventVerified>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
            css="margin-right: 20px;"
          >
            You have no verified tweets.
          </Text>
          <TwitterHashtagButton
            tag={hashTag}
            options={{
              size: 'large',
              screenName: userState.screenName
            }}
          />
        </HaventVerified>
      </Container>
      {twitterState.tweets.map((tweet, index) => (
        <TweetEmbedContainer key={index}>
          {tweet.approved ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <Img src="/icons/ok.svg"/>
            </a>
          ) : null}
          {Boolean(tweet.rejected) ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <Img src="/icons/close.svg"/>
            </a>
          ) : null}
          {Boolean(!tweet.approved && !tweet.rejected) ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <MiniLoader />
            </a>
          ) : null}
          <TwitterTweetEmbed
            screenName={userState.screenName}
            tweetId={tweet.idStr}
            options={{
              width: isTabletOrMobile ? WIDTH_MOBILE : WIDTH_DEFAULT
            }}
          />
        </TweetEmbedContainer>
      ))}
    </Container>
  );
};
