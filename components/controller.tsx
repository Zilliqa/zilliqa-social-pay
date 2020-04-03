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

import {
  FontSize,
  Fonts,
  Events,
  FontColors
} from 'config';
import { fromZil } from 'utils/from-zil';
import { timerCalc } from 'utils/timer';

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
  const twitterState = Effector.useStore(TwitterStore.store);

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
      <ProgressCircle pct={calculPercent}/>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
        css="align-self: center;"
      >
        Contract balance used.
      </Text>
      {timerDay === 0 && !userState.synchronization ? null : userState.synchronization ? (
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProDemi}
          fontColors={FontColors.white}
        >
          Waiting for address to sync...
        </Text>
      ) : (
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProDemi}
          fontColors={FontColors.white}
        >
          You can participate: {moment(timerDay).fromNow()}
        </Text>
      )}
    </ControlContainer>
  );
};
