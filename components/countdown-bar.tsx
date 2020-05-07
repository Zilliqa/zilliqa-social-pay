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

  const [countDown, setCountDown] = React.useState<number>(0);
  const [hours, sethours] = React.useState<number>(0);

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

      const days = diffTime.days();
      const months = diffTime.months();
      const gotHours = diffTime.hours();

      sethours((days * 24) + (months * 730) + gotHours);
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
        SocialPay Campaign ends in: {hours}:{moment(countDown).format('mm:ss')}
      </Text>
    </CountdownBarContainer>
  );
};

export default CountdownBar;
