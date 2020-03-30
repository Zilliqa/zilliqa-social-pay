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
import { timerCalcDay } from 'utils/timer';
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(AroundedContainer)`
  padding-left: 15px;
  padding-right: 15px;
  align-items: flex-start;
`;

/**
 * Controller is component show information about
 * contract, blockchain, user account.
 * @example
 * import { Controller } from 'components/controller';
 * <Controller />
 */
export const Controller: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);

  // Search value.
  const [searchValue, setSearchValue] = React.useState<string | null>(null);

  /**
   * Calculate the time for next action.
   */
  const timer = React.useMemo(
    () => timerCalcDay(blockchainState, userState),
    [blockchainState, userState]
  );

  /**
   * Validation and parse tweet url or ID, before send to server and blockchain.
   * @param event - HTMLInput event.
   */
  const handleInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setSearchValue(null);
      return null;
    }

    let { value } = event.target;

    // If user pass tweet ID.
    if (!isNaN(Number(value))) {
      setSearchValue(value);

      return null;
    }

    value = value.replace(/\?.*/gm, '');

    // Parse and search tweet ID.
    const foundTweetId = value
      .split('/')
      .filter(Boolean)
      .find((el) => Number.isInteger(Number(el)));

    if (!foundTweetId) {
      return null;
    }

    // If value is valid than update `searchValue` state.
    setSearchValue(foundTweetId);
  }, [setSearchValue, searchValue]);
  /**
   * Handle when form has been submited and send tweet ID to server.
   * @param event - HTMLForm event.
   */
  const handleSearch = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchValue) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    // Send to server tweet ID (`searchValue`).
    const tweet = await SearchTweet(
      searchValue,
      userState.jwtToken
    );
    EventStore.reset();

    // Show result from server.
    EventStore.setContent(tweet);

    // If server responsed error.
    if (tweet.message) {
      EventStore.setEvent(Events.Error);
      return null;
    }

    EventStore.setEvent(Events.Twitter);
  } , [searchValue, userState]);
  /**
   * Handle click to reload icon.
   * Just update user information.
   */
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
