import React from 'react';
import { validation } from '@zilliqa-js/util';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import EventStore from 'store/event';

import { Text } from 'components/text';
import { Img } from 'components/img';
import { FieldInput } from 'components/Input';
import { Container } from 'components/container';
import { Button } from 'components/button';
import { TwitterConnectContainer } from 'components/twitter-conecter';

import {
  FontColors,
  Fonts,
  FontSize,
  Sides,
  ButtonVariants,
  SizeComponent,
  Events
} from 'config';

type Prop = {
  show?: boolean;
};

export const ZilliqaConnect: React.FC<Prop> = ({ show }) => {
  const userState = Effector.useStore(UserStore.store);

  const [addressErr, setAddressErr] = React.useState<string | null | undefined>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  const handleAddressChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressErr(null);

    if (!event.target.value) {
      return null;
    }

    setAddress(event.target.value);
  }, [validation, setAddressErr, addressErr]);
  const handleAddAddress = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      setAddressErr('address must be required.');

      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    EventStore.setEvent(Events.Load);
    const result = await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });

    if (result.message !== 'ConfiguredUserAddress') {
      setAddressErr(result.message);
    }

    EventStore.setEvent(Events.None);
  }, [setAddressErr, address]);

  return (
    <TwitterConnectContainer
      style={{ display: show ? 'flex' : 'none' }}
      onSubmit={handleAddAddress}
    >
      <Img
        src="/icons/zilliqa-logo.svg"
        css="width: 70px;"
      />
      <Text
        align={Sides.center}
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProDemi}
        size={FontSize.sm}
      >
        Connect your Zilliqa address
      </Text>
      <Container css="width: 250px;">
        <FieldInput
          variants={ButtonVariants.info}
          sizeVariant={SizeComponent.md}
          error={addressErr}
          placeholder="Zilliqa address (zil1)"
          onChange={handleAddressChange}
        />
      </Container>
      <Button
        variant={ButtonVariants.outlet}
        sizeVariant={SizeComponent.md}
      >
        Connect
      </Button>
    </TwitterConnectContainer>
  );
};
