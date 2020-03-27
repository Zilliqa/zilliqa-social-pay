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
import { TwitterHashtagButton, TwitterTweetEmbed } from 'react-twitter-embed';

import { FontSize, Fonts } from 'config';
import { viewTx } from 'utils/viewblock';

const VerifiedContainer = styled.div`
  margin-top: 30px;
`;
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

export const Verified: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const hashTag = React.useMemo(() => {
    if (!blockchainState.hashtag) {
      return '';
    }

    const splited = blockchainState.hashtag.split('');

    splited[1] = splited[1].toUpperCase();

    return splited.join('');
  }, [blockchainState]);

  return (
    <VerifiedContainer>
      {!twitterState.tweets || twitterState.tweets.length < 1 ? (
        <HaventVerified>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
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
      ) : twitterState.tweets.map((tweet, index) => (
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
    </VerifiedContainer>
  );
};
