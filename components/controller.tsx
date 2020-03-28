import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';
import moment from 'moment';

import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import UserStore from 'store/user';

import { Text } from 'components/text';
import { Search } from 'components/Input';
import { Button } from 'components/button';
import { AroundedContainer } from 'components/rounded-container';
import { Img } from 'components/img';

import {
  FontSize,
  Fonts,
  SizeComponent,
  Events,
  FontColors
} from 'config';
import { fromZil } from 'utils/from-zil';
import { timerCalc } from 'utils/timer';
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(AroundedContainer)`
  padding-left: 15px;
  padding-right: 15px;
  align-items: flex-start;
`;

export const Controller: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);

  const [searchValue, setSearchValue] = React.useState<string | null>(null);

  const timer = React.useMemo(
    () => timerCalc(blockchainState, userState),
    [blockchainState, userState]
  );

  const handleInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setSearchValue(null);
      return null;
    }

    const { value } = event.target;

    if (!isNaN(Number(value))) {
      setSearchValue(value);

      return null;
    }

    const foundTweetId = value
      .split('/')
      .filter(Boolean)
      .find((el) => Number.isInteger(Number(el)));

    if (!foundTweetId) {
      return null;
    }

    setSearchValue(foundTweetId);
  }, [setSearchValue, searchValue]);
  const handleSearch = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchValue) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    const tweet = await SearchTweet(
      searchValue,
      userState.jwtToken
    );
    EventStore.reset();
    EventStore.setContent(tweet);

    if (tweet.message) {
      EventStore.setEvent(Events.Error);
      return null;
    }

    EventStore.setEvent(Events.Twitter);
  } , [searchValue, userState]);
  const handleUpdateUser = React.useCallback(async () => {
    EventStore.setEvent(Events.Load);
    await UserStore.updateUserState(null);
    EventStore.reset();
  }, [UserStore]);

  return (
    <ControlContainer onSubmit={handleSearch}>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        ZIL per tweet: {fromZil(blockchainState.zilsPerTweet)} ZIL
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        Balance: {fromZil(userState.balance)} ZIL <Img
          src="/icons/refresh.svg"
          css="cursor: pointer;"
          onClick={handleUpdateUser}
        />
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
        css="text-transform: capitalize;"
      >
        Hashtag: {blockchainState.hashtag}
      </Text>
      <Search
        sizeVariant={SizeComponent.md}
        disabled={timer !== 0}
        css="margin-top: 30px;"
        placeholder="Paste your Tweet link here"
        onChange={handleInput}
      />
      {timer === 0 ? (
        <Button
          sizeVariant={SizeComponent.lg}
          disabled={Boolean(!searchValue)}
          css="margin-top: 10px;"
        >
          Search Tweet
        </Button>
      ) : (
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProDemi}
          fontColors={FontColors.white}
        >
          You can participate: {moment(timer).fromNow()}
        </Text>
      )}
    </ControlContainer>
  );
};
