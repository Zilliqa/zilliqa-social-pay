import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Modal } from 'components/modal';
import { Card } from 'components/card';
import { FieldInput } from 'components/Input';
import { Text } from 'components/text';

import { Events, SizeComponent } from 'config';

export const SettingsModal = styled(Card)`
  width: 300px;
`;

export const FixedWrapper: React.FC = () => {
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);

  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string>(userState.zilAddress);

  const handleAddressChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return null;
    } else if (!validation.isBech32(event.target.value)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    setAddress(event.target.value);

    await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });
  }, [address, validation, setAddressErr, addressErr]);

  React.useEffect(() => {
    if (!address || address.length < 1) {
      setAddress(userState.zilAddress);
    }
  }, [address, setAddress, userState]);

  return (
    <React.Fragment>
      <Modal
        show={eventState.current === Events.Settings}
        onBlur={() => EventStore.reset()}
      >
        <SettingsModal title="Settings">
          <Text>
            Your Zilliqa address
          </Text>
          <FieldInput
            defaultValue={address}
            sizeVariant={SizeComponent.md}
            error={addressErr}
            css="font-size: 15px;width: 350px;"
            onBlur={handleAddressChange}
            onChange={() => setAddressErr(null)}
          />
        </SettingsModal>
      </Modal>
    </React.Fragment>
  );
};
