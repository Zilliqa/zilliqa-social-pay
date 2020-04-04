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

import {
  FontSize,
  Fonts,
  Events,
  FontColors,
  SizeComponent
} from 'config';
import { fromZil } from 'utils/from-zil';
import { timerCalc } from 'utils/timer';
import { Container } from './container';

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
  const [disabled, setDisabled] = React.useState<boolean>(true);
  const [icon, setIcon] = React.useState<InputIcons>(InputIcons.timer);

  const calculPercent = React.useMemo(() => {
    const _100 = 100;

    if (Number(blockchainState.initBalance) === 0) {
      return 0;
    }

    const amount = Number(blockchainState.balance) / Number(blockchainState.initBalance);

    if (amount > _100) {
      return _100;
    }

    return Math.round(amount * _100);
  }, [blockchainState]);
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
    [blockchainState, twitterState]
  );

  React.useEffect(() => {
    if (userState.synchronization) {
      setValue('Waiting for address to sync...');
      setDisabled(true);
      setIcon(InputIcons.refresh);
    } else if (timerDay > 0) {
      setValue(`You can participate: ${moment(timerDay).fromNow()}`);
      setDisabled(true);
      setIcon(InputIcons.timer);
    } else if (timerDay === 0 && !userState.synchronization) {
      setDisabled(false);
      setValue('');
      setIcon(InputIcons.search);
    }
  }, [
    setIcon,
    setDisabled,
    setValue,
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
    <ControlContainer>
      <Container css="position: absolute;transform: translate(160%, -110%);">
        <ProgressCircle pct={calculPercent} />
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
        value={value}
        icon={icon}
        disabled={disabled}
        placeholder="Paste your tweet link here"
        css="font-size: 12px;height: 40px;"
      />
    </ControlContainer>
  );
};
