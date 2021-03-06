import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';
import ReactPaginate from 'react-paginate';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import NotificationStore from 'store/notification';

import { MinLoader } from 'components/min-loader';
import { Img } from 'components/img';
import { Container } from 'components/container';
import { NotificationWarning } from 'components/notification-control';
import { TwitterTweetEmbed } from 'react-twitter-embed';

import { Events } from 'config';
import NOTIFICATIONS_TYPES from 'config/notifications-types';
import { viewTx } from 'utils/viewblock';
import { Twitte } from 'interfaces';
import { deepCopy } from 'utils/deep-copy';
import { toUnique } from 'utils/to-unique';

const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;
const PAGE_LIMIT = 3;
const SLEEP = 100;

const VerifiedContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: ${WIDTH_MOBILE}px;
`;
const IconsContainer = styled.div`
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
  margin-right: 10px;

  @media (max-width: 562px) {
    min-width: unset;
  }
`;
const TweetEmbedContainer = styled.div`
  display: ${(props: { show?: boolean; }) => props.show ? 'flex' : 'none'};
  align-items: center;

  max-width: 560px;

  animation-duration: 1.3s;
  animation-name: fadeInDown;

  @media (max-width: 562px) {
    margin-top: 50px;
    flex-direction: column;
    margin-bottom: 10%;
  }
`;

/**
 * Show user tweets.
 */
export const Verified: React.FC = () => {
  const router = useRouter();
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 562px)' });

  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const notificationState = Effector.useStore(NotificationStore.store);

  const [paginateOffset, setPaginateOffset] = React.useState(0);
  const sortedTweets = React.useMemo(() => {
    const array = deepCopy(twitterState.tweets)
      .sort((a: Twitte, b: Twitte) => {
        return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
      })
      .splice(paginateOffset, PAGE_LIMIT);

    return toUnique(array, 'idStr');
  }, [
    twitterState.tweets,
    paginateOffset,
    PAGE_LIMIT
  ]);

  const handleClickClaim = React.useCallback(async (tweet: Twitte) => {
      EventStore.setContent(tweet);
      EventStore.setEvent(Events.Claimed);
  }, [userState, blockchainState, twitterState, router, setPaginateOffset]);
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
  const handTweetLoad = React.useCallback(async (loaded, tweete: Twitte) => {
    if (!loaded) {
      await TwitterStore.deleteTweet({
        tweete,
        jwt: userState.jwtToken
      });
      TwitterStore.setShowTwitterTweetEmbed(false);
      setTimeout(() => TwitterStore.setShowTwitterTweetEmbed(true), SLEEP);

      return null;
    }
  }, [userState.jwtToken]);

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
    <VerifiedContainer>
      {twitterState.showTwitterTweetEmbed ? sortedTweets.map((tweet: Twitte, index: number) => (
        <Container key={index}>
          <TweetEmbedContainer show={true}>
            <IconsContainer>
              {(!tweet.claimed && !tweet.approved && !tweet.rejected && !isTabletOrMobile) ? (
                <Img
                  src="/icons/refund.svg"
                  css="cursor: pointer;width: 100px;height: 40px;"
                  onClick={() => handleClickClaim(tweet)}
                />
              ) : null}
              {tweet.approved && !isTabletOrMobile ? (
                <a
                  href={tweet.txId ? viewTx(tweet.txId) : undefined}
                  target="_blank"
                >
                  <Img src="/icons/ok.svg" />
                </a>
              ) : null}
              {Boolean(tweet.rejected && !isTabletOrMobile) ? (
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
              {Boolean(!tweet.approved && !tweet.rejected && tweet.claimed && !isTabletOrMobile) ? (
                <a
                  href={tweet.txId ? viewTx(tweet.txId) : undefined}
                  target="_blank"
                >
                  <MinLoader width="40" height="40" />
                </a>
              ) : null}
            </IconsContainer>
            <TwitterTweetEmbed
              screenName={userState.screenName}
              tweetId={tweet.idStr}
              options={{
                width: isTabletOrMobile ? WIDTH_MOBILE : WIDTH_DEFAULT
              }}
              onLoad={(content: any) => handTweetLoad(Boolean(content), tweet)}
            />
            <IconsContainer>
              {(!tweet.claimed && !tweet.approved && !tweet.rejected && isTabletOrMobile) ? (
                <Img
                  src="/icons/refund.svg"
                  css="cursor: pointer;width: 100px;height: 40px;"
                  onClick={() => handleClickClaim(tweet)}
                />
              ) : null}
              {tweet.approved && isTabletOrMobile ? (
                <a
                  href={tweet.txId ? viewTx(tweet.txId) : undefined}
                  target="_blank"
                >
                  <Img src="/icons/ok.svg" />
                </a>
              ) : null}
              {Boolean(tweet.rejected && isTabletOrMobile) ? (
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
              {Boolean(!tweet.approved && !tweet.rejected && tweet.claimed && isTabletOrMobile) ? (
                <a
                  href={tweet.txId ? viewTx(tweet.txId) : undefined}
                  target="_blank"
                >
                  <MinLoader width="40" height="40" />
                </a>
              ) : null}
            </IconsContainer>
          </TweetEmbedContainer>
        </Container>
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
    </VerifiedContainer>
  );
};

export default Verified;
