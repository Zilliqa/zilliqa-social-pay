import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
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

const DAYS_OF_HOURS = 24;

export const CountdownBar: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [countDown, setCountDown] = React.useState<number>(0);

  React.useEffect(() => {
    const interval = 1000;

    const timer = setInterval(() => {
      let diffTime = null;

      if (!blockchainState.campaignEnd || !blockchainState.now) {
        return null;
      }

      if (!countDown) {
        const campaignEnd = new Date(blockchainState.campaignEnd).valueOf();
        const now = new Date(blockchainState.now).valueOf();

        diffTime = moment(campaignEnd - now);
      } else {
        diffTime = moment(countDown);
      }

      diffTime.subtract(1, 'second');

      setCountDown(diffTime.valueOf());
    }, interval);

    return () => clearTimeout(timer);
  }, [blockchainState.campaignEnd, countDown]);

  return (
    <CountdownBarContainer>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        SocialPay Campaign ends in: {moment(countDown).days() * DAYS_OF_HOURS}:{moment(countDown).format('mm:ss')}
      </Text>
    </CountdownBarContainer>
  );
};

export default CountdownBar;
