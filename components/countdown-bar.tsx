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

export const CountdownBar: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const end = React.useMemo(() => {
    if (!blockchainState.campaignEnd || !blockchainState.now) {
      return null;
    }

    const now = new Date(blockchainState.now);
    const campaignEnd = new Date(blockchainState.campaignEnd);
    const difference = campaignEnd.valueOf() - now.valueOf();

    if (difference < 0) {
      return 'SocialPay Campaign has ended!';
    }

    return `SocialPay Campaign ends: ${moment(campaignEnd).from(now)}`;
  }, [blockchainState]);

  return (
    <CountdownBarContainer>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        {end}
      </Text>
    </CountdownBarContainer>
  );
};

export default CountdownBar;
