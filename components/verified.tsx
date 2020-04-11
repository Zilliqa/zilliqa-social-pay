import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import ReactPaginate from 'react-paginate';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';

import { Text } from 'components/text';
import { MinLoader } from 'components/min-loader';
import { Img } from 'components/img';
import { Container } from 'components/container';
import { TwitterHashtagButton, TwitterTweetEmbed } from 'react-twitter-embed';

import { FontSize, Fonts, FontColors, Events } from 'config';
import { viewTx } from 'utils/viewblock';
import { claimTweet } from 'utils/claim-tweet';
import { Twitte } from 'interfaces';
import { timerCalc } from 'utils/timer';
import { deepCopy } from 'utils/deep-copy';

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
  grid-gap: 10px;
`;

const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;
const PAGE_LIMIT = 3;
const SLEEP = 10;
/**
 * Show user tweets.
 */
export const Verified: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [paginateOffset, setPaginateOffset] = React.useState(0);
  const [showTwitterTweetEmbed, setShowTwitterTweetEmbed] = React.useState(true);

  /**
   * Hash tag from smart contract.
   */
  const hashTag = React.useMemo(() => {
    if (!blockchainState.hashtag) {
      return null;
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
  const timerDay = React.useMemo(
    () => timerCalc(
      blockchainState,
      userState,
      twitterState.lastBlockNumber,
      Number(blockchainState.blocksPerDay)
    ),
    [blockchainState, twitterState]
  );
  const sortedTweets = React.useMemo(() => {
    const maxDateValue = Math.max.apply(Math, twitterState.tweets.map(
      (tw) => new Date(tw.createdAt).valueOf())
    );

    return deepCopy(twitterState.tweets)
      .sort((a: Twitte, b: Twitte) => {
        if (a.claimed) {
          return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf() + maxDateValue;
        } else if (b.claimed) {
          return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf() + maxDateValue;
        }

        return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
      })
      .splice(paginateOffset, PAGE_LIMIT);
  }, [
    twitterState,
    paginateOffset,
    PAGE_LIMIT
  ]);

  const handleClickClaim = React.useCallback(async (tweet: Twitte) => {
    EventStore.setEvent(Events.Load);

    await UserStore.updateUserState(null);
    await BlockchainStore.updateBlockchain(null);

    if (userState.synchronization) {
      EventStore.setContent({
        message: 'Waiting for address to sync...'
      });
      EventStore.setEvent(Events.Error);

      return null;
    } else if (timerDay !== 0) {
      EventStore.setContent({
        message: `You can participate: ${moment(timerDay).fromNow()}`
      });
      EventStore.setEvent(Events.Error);

      return null;
    } else if (!userState.zilAddress) {
      EventStore.setContent({
        message: 'For claim you need configuration Zilliqa address.'
      });
      EventStore.setEvent(Events.Error);

      return null;
    }

    await claimTweet(userState.jwtToken, tweet);
    EventStore.reset();
  }, [userState, timerDay]);
  const handleNextPageClick = React.useCallback(async (data) => {
    const selected = Number(data.selected);
    const offset = Math.ceil(selected * PAGE_LIMIT);

    setShowTwitterTweetEmbed(false);
    setPaginateOffset(offset);

    if (offset >= twitterState.tweets.length) {
      EventStore.setEvent(Events.Load);

      await TwitterStore.getTweets({ offset, limit: PAGE_LIMIT });

      EventStore.reset();
    }

    setTimeout(() => setShowTwitterTweetEmbed(true), SLEEP);
  }, [
    setPaginateOffset,
    setShowTwitterTweetEmbed,
    twitterState,
    SLEEP
  ]);

  return (
    <Container>
      <Container css={nonTweets}>
        <HaventVerified>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            You have no verified tweets.
          </Text>
          {hashTag ? <TwitterHashtagButton
            tag={hashTag}
            options={{
              size: 'large',
              screenName: userState.screenName
            }}
          /> : null}
        </HaventVerified>
      </Container>
      {twitterState.count > PAGE_LIMIT ? (
        <ReactPaginate
          previousLabel={'previous'}
          nextLabel={'next'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={twitterState.count / PAGE_LIMIT}
          marginPagesDisplayed={1}
          pageRangeDisplayed={1}
          onPageChange={handleNextPageClick}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      ) : null}
      {showTwitterTweetEmbed ? sortedTweets.map((tweet: Twitte, index: number) => (
        <TweetEmbedContainer key={index}>
          {(!tweet.claimed && !tweet.approved && !tweet.rejected) ? (
            <Img
              src="/icons/refund.svg"
              css="cursor: pointer;"
              onClick={() => handleClickClaim(tweet)}
            />
          ) : null}
          {tweet.approved ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <Img src="/icons/ok.svg" />
            </a>
          ) : null}
          {Boolean(tweet.rejected) ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <Img src="/icons/close.svg" />
            </a>
          ) : null}
          {Boolean(!tweet.approved && !tweet.rejected && tweet.claimed) ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <MinLoader />
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
      )) : null}
    </Container>
  );
};

export default Verified;
