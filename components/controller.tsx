import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';

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
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(AroundedContainer)`
  padding: 30px;
  margin-top: 7px;
  align-items: flex-start;

  @media (max-width: 440px) {
    margin-bottom: 30px;
  }
`;
const DashboardContainer = styled(Container)`
  position: absolute;
  transform: translate(150%, -125%);

  @media (max-width: 440px) {
    position: relative;
    transform: none;
  }
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

    if (!value) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    // Send to server tweet ID (`value`).
    const result = await SearchTweet(
      value,
      userState.jwtToken
    );
    EventStore.reset();

    if (result.message) {
      EventStore.setContent(result);
      EventStore.setEvent(Events.Error);

      return null;
    }

    EventStore.setContent(result);
    EventStore.setEvent(Events.Twitter);
  }, [value, userState]);

  React.useEffect(() => {
    if (userState.synchronization) {
      setValue('');
      setPlaceholder('Waiting for address to sync...');
      setDisabled(true);
      setIcon(InputIcons.refresh);
    } else if (Boolean(blockchainState.dayTimer)) {
      setValue('');
      setPlaceholder(`You can participate: ${blockchainState.dayTimer}`);
      setDisabled(true);
      setIcon(InputIcons.timer);
    } else if (!Boolean(blockchainState.dayTimer) && !userState.synchronization) {
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
    userState,
    setValue,
    blockchainState
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
      <DashboardContainer>
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
      </DashboardContainer>
      <Text
        size={FontSize.md}
        fontVariant={Fonts.AvenirNextLTProRegular}
        fontColors={FontColors.white}
      >
        Dashboard
      </Text>
      <Text
        size={FontSize.xs}
        fontVariant={Fonts.AvenirNextLTProRegular}
        fontColors={FontColors.gray}
      >
        BALANCE
        <Text
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
          css="font-size: 15px;"
        >
          {fromZil(userState.balance)} ZIL <Img
            src="/icons/refresh.svg"
            css="cursor: pointer;font-size: 15px;"
            onClick={handleUpdateUser}
          />
        </Text>
      </Text>
      <Text
        size={FontSize.xs}
        fontVariant={Fonts.AvenirNextLTProRegular}
        fontColors={FontColors.gray}
      >
        $ZIL PER TWEET
        <Text
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
          css="font-size: 15px;"
        >
          {fromZil(blockchainState.zilsPerTweet)} $ZIL
        </Text>
      </Text>
      <Text
        size={FontSize.xs}
        fontVariant={Fonts.AvenirNextLTProRegular}
        fontColors={FontColors.gray}
      >
        HASHTAG
        <Text
          fontVariant={Fonts.AvenirNextLTProBold}
          fontColors={FontColors.white}
          css="text-transform: capitalize;font-size: 15px;"
        >
          {blockchainState.hashtag}
        </Text>
      </Text>
      <Input
        sizeVariant={SizeComponent.md}
        value={value}
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

export default Controller;
