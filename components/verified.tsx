import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';

import { Text } from 'components/text';
import { TwitterHashtagButton } from 'react-twitter-embed';

import { FontSize, Fonts } from 'config';

const VerifiedContainer = styled.div`
`;
const HaventVerified = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 25rem;
  margin-top: 30px;
`;

export const Verified: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);

  return (
    <VerifiedContainer>
      {!twitterState.tweets || twitterState.tweets.length < 1 ? (
        <HaventVerified>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
          >
            You have not verified tweets.
          </Text>
          <TwitterHashtagButton
            tag={blockchainState.hashtag || ''}
            options={{
              size: 'large',
              screenName: userState.screenName
            }}
          />
        </HaventVerified>
      ) : null}
    </VerifiedContainer>
  );
};
