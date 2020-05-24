import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import BlockchainStore from 'store/blockchain';

import { Container } from 'components/container';
import { Text } from 'components/text';

import { FontColors, FontSize, Fonts } from 'config';

const CountdownBarContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;

  grid-area: countdown-bar;

  min-height: 40px;
  width: 100%;

  background-color: ${FontColors.primary};
`;

export const CountdownBar: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [countDown, setCountDown] = React.useState<string>('');
  const [secondsLeft, setsecondsLeft] = React.useState<number>(0);

  React.useEffect(() => {
    const interval = 1000;

    const timer = setInterval(() => {
      if (!blockchainState.campaignEnd || !blockchainState.now) {
        return null;
      }

      const countDownDate = new Date(blockchainState.campaignEnd).getTime();
      const now = new Date(blockchainState.now).getTime();
      const timeleft = countDownDate - now - secondsLeft;

      const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      setCountDown(`${days * 24 + hours} hrs : ${minutes} mins : ${seconds} secs`);
      setsecondsLeft(interval + secondsLeft);
    }, interval);
    return () => clearTimeout(timer);
  }, [blockchainState.campaignEnd, countDown, secondsLeft]);

  return (
    <CountdownBarContainer>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        Campaign ends in: {countDown}
      </Text>
    </CountdownBarContainer>
  );
};

export default CountdownBar;
