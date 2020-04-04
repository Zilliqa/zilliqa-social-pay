import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';
import moment from 'moment';

import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import UserStore from 'store/user';
import TwitterStore from 'store/twitter';

import { Text } from 'components/text';
import { ProgressCircle } from 'components/progress-circle';
import { AroundedContainer } from 'components/rounded-container';
import { Img } from 'components/img';
import { Input, InputIcons } from 'components/Input';
import { Button } from 'components/button';
import { Container } from 'components/container';

import {
  FontSize,
  Fonts,
  Events,
  FontColors,
  SizeComponent,
  ButtonVariants
} from 'config';
import { fromZil } from 'utils/from-zil';
import { timerCalc } from 'utils/timer';
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(AroundedContainer)`
  padding: 30px;
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
  const twitterState = Effector.useStore(TwitterStore.store);

  const [value, setValue] = React.useState<string>('');
  const [placeholder, setPlaceholder] = React.useState<string>();
  const [disabled, setDisabled] = React.useState<boolean>();
  const [icon, setIcon] = React.useState<InputIcons>(InputIcons.timer);

  /**
   * Calculate the time for next action.
   */
  const timerDay = React.useMemo(
    () => timerCalc(
      blockchainState,
      userState,
      twitterState.tweets,
      Number(blockchainState.blocksPerDay)
    ),
    [blockchainState, twitterState, userState]
  );

  /**
   * Validation and parse tweet url or ID, before send to server and blockchain.
   * @param event - HTMLInput event.
   */
  const handleInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setValue('');
      return null;
    }

    let inputValue = event.target.value;

    // If user pass tweet ID.
    if (!isNaN(Number(inputValue))) {
      setValue(inputValue);

      return null;
    }

    inputValue = inputValue.replace(/\?.*/gm, '');

    // Parse and search tweet ID.
    const foundTweetId = inputValue
      .split('/')
      .filter(Boolean)
      .find((el) => Number.isInteger(Number(el)));

    if (!foundTweetId) {
      return null;
    }

    // If value is valid than update `value` state.
    setValue(foundTweetId);
  }, [setValue]);
  /**
   * Handle when form has been submited and send tweet ID to server.
   * @param event - HTMLForm event.
   */
  const handleSearch = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(value);

    if (!value) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    // Send to server tweet ID (`value`).
    const tweet = await SearchTweet(
      value,
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
  }, [value, userState]);

  React.useEffect(() => {
    if (userState.synchronization) {
      setPlaceholder('Waiting for address to sync...');
      setDisabled(true);
      setIcon(InputIcons.refresh);
    } else if (timerDay > 0) {
      setPlaceholder(`You can participate: ${moment(timerDay).fromNow()}`);
      setDisabled(true);
      setIcon(InputIcons.timer);
    } else if (timerDay === 0 && !userState.synchronization) {
      setDisabled(false);
      setPlaceholder('Paste your tweet link here');
      setIcon(InputIcons.search);
    }
  }, [
    setIcon,
    setDisabled,
    disabled,
    setPlaceholder,
    value,
    userState
  ]);

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
      <Container css="position: absolute;transform: translate(160%, -110%);">
        <ProgressCircle
          pct={twitterState.verifiedCount}
          count={twitterState.count}
        />
        <Text
          size={FontSize.sm}
          fontColors={FontColors.white}
        >
          Verified tweets
        </Text>
      </Container>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProBold}
        fontColors={FontColors.white}
      >
        Dashboard
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.gray}
      >
        BALANCE
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
        >
          {fromZil(userState.balance)} ZIL <Img
            src="/icons/refresh.svg"
            css="cursor: pointer;"
            onClick={handleUpdateUser}
          />
        </Text>
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.gray}
      >
        $ZIL PER TWEET
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
        >
          {fromZil(blockchainState.zilsPerTweet)} $ZIL
        </Text>
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.gray}
      >
        HASHTAG
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
          css="text-transform: capitalize;"
        >
          {blockchainState.hashtag}
        </Text>
      </Text>
      <Input
        sizeVariant={SizeComponent.md}
        defaultValue={value}
        icon={icon}
        disabled={disabled}
        onChange={handleInput}
        placeholder={placeholder}
        css="font-size: 12px;height: 40px;"
      />
      {!disabled ? (
        <Button
          sizeVariant={SizeComponent.md}
          variant={ButtonVariants.outlet}
          css="margin-top: 10px;"
        >
          Search
        </Button>
      ) : null}
    </ControlContainer>
  );
};
