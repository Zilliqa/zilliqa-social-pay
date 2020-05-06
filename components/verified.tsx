import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import ReactPaginate from 'react-paginate';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import NotificationStore from 'store/notification';

import { Text } from 'components/text';
import { MinLoader } from 'components/min-loader';
import { Img } from 'components/img';
import { Container } from 'components/container';
import { NotificationWarning } from 'components/notification-control';
import { TwitterHashtagButton, TwitterTweetEmbed } from 'react-twitter-embed';

import { FontSize, Fonts, FontColors, Events } from 'config';
import ERROR_CODES from 'config/error-codes';
import NOTIFICATIONS_TYPES from 'config/notifications-types';
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
  grid-template-columns: 100px 1fr;
  grid-gap: 10px;
  justify-items: end;

  @media (max-width: 412px) {
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr;
  }
`;

const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;
const PAGE_LIMIT = 3;
const SLEEP = 10;
/**
 * Show user tweets.
 */
export const Verified: React.FC = () => {
  const router = useRouter();
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const notificationState = Effector.useStore(NotificationStore.store);

  const [paginateOffset, setPaginateOffset] = React.useState(0);

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
    } else if (Boolean(blockchainState.dayTimer)) {
      EventStore.setContent({
        message: `You can participate: ${blockchainState.dayTimer}`
      });
      EventStore.setEvent(Events.Error);

      return null;
    } else if (!userState.zilAddress) {
      EventStore.setContent({
        message: 'Please configure your Zilliqa address.'
      });
      EventStore.setEvent(Events.Error);

      return null;
    }

    const result = await claimTweet(userState.jwtToken, tweet);

    if (result.code === ERROR_CODES.lowFavoriteCount || result.code === ERROR_CODES.campaignDown) {
      EventStore.setContent(result);
      EventStore.setEvent(Events.Error);

      return null;
    } else if (result.code === ERROR_CODES.unauthorized) {
      router.push('/auth');

      return null;
    }

    if (result.message) {
      TwitterStore.setLastBlock(result.lastTweet);
      BlockchainStore.updateStore({
        ...blockchainState,
        BlockNum: result.currentBlock
      });

      const time = timerCalc(
        blockchainState,
        result.lastTweet,
        Number(blockchainState.blocksPerDay)
      );
      EventStore.setContent({
        message: `You can participate: ${moment(time).fromNow()}`
      });
      EventStore.setEvent(Events.Error);
    } else {
      TwitterStore.setLastBlock(result.block);
      BlockchainStore.updateTimer();
      EventStore.reset();
    }
  }, [userState, blockchainState, twitterState, router]);
  const handleNextPageClick = React.useCallback(async (data) => {
    const selected = Number(data.selected);
    const offset = Math.ceil(selected * PAGE_LIMIT);

    TwitterStore.setShowTwitterTweetEmbed(false);
    setPaginateOffset(offset);

    if (offset >= twitterState.tweets.length) {
      EventStore.setEvent(Events.Load);

      await TwitterStore.getTweets({ offset, limit: PAGE_LIMIT });

      EventStore.reset();
    }

    setTimeout(() => TwitterStore.setShowTwitterTweetEmbed(true), SLEEP);
  }, [
    setPaginateOffset,
    twitterState,
    SLEEP
  ]);

  /**
   * Effect for loading tweets rewards.
   * If tweet is loading then show user notification.
   */
  React.useEffect(() => {
    const lastNotification = notificationState.serverNotifications[0];

    if (lastNotification && lastNotification.type === NOTIFICATIONS_TYPES.addressConfiguring) {
      NotificationStore.addLoadingNotifly(
        <NotificationWarning>
          <MinLoader height="40" width="40" />
          {lastNotification.description}
        </NotificationWarning>
      );
    } else if (lastNotification && lastNotification.type === NOTIFICATIONS_TYPES.tweetClaiming) {
      NotificationStore.addLoadingNotifly(
        <NotificationWarning>
          <MinLoader height="40" width="40" />
          {lastNotification.description}
        </NotificationWarning>
      );
    }
  }, [notificationState.serverNotifications]);

  return (
    <Container>
      <Container css={nonTweets}>
        <HaventVerified>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            No tweets found.
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
      {twitterState.showTwitterTweetEmbed ? sortedTweets.map((tweet: Twitte, index: number) => (
        <TweetEmbedContainer key={index}>
          {(!tweet.claimed && !tweet.approved && !tweet.rejected) ? (
            <Img
              src="/icons/refund.svg"
              css="cursor: pointer;width: 100px;height: 40px;"
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
              <Img
                src="/icons/close.svg"
                css="width: 40px;height: 40px;"
              />
            </a>
          ) : null}
          {Boolean(!tweet.approved && !tweet.rejected && tweet.claimed) ? (
            <a
              href={tweet.txId ? viewTx(tweet.txId) : undefined}
              target="_blank"
            >
              <MinLoader width="40" height="40" />
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
          containerClassName={'pagination' + ` ${isTabletOrMobile ? 'mobile' : 'desktop'}`}
          activeClassName={'active'}
        />
      ) : null}
    </Container>
  );
};

export default Verified;
