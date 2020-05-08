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
import { AroundedContainer } from 'components/rounded-container';
import { TextWarning } from 'components/warning-text';
import { Link } from 'components/link';

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
  connected: () => void;
};

/**
 * Use for validation and send to server your Zilliqa address.
 * @prop show - Show or hidden component.
 */
export const ZilliqaConnect: React.FC<Prop> = ({ show, connected }) => {
  const userState = Effector.useStore(UserStore.store);

  // State for error handlers.
  const [addressErr, setAddressErr] = React.useState<string | null | undefined>(null);
  // State for address in bech32 (zil1).
  const [address, setAddress] = React.useState<string | null>(null);

  /**
   * Handle when address has been changed.
   * @param event - HTMLInput event.
   */
  const handleAddressChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressErr(null);

    if (!event.target.value) {
      return null;
    }

    setAddress(event.target.value);
  }, [validation, setAddressErr, addressErr]);
  /**
   * Handle form submited and send to server.
   * @param event - HTMLForm event.
   */
  const handleAddAddress = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      setAddressErr('An address is required.');

      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorrect address format.');

      return null;
    }

    EventStore.setEvent(Events.Load);

    const result = await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });

    if (result.message !== 'ConfiguredUserAddress') {
      setAddressErr(result.message);
    } else if (result.message === 'ConfiguredUserAddress') {
      connected();
    }

    EventStore.setEvent(Events.None);
  }, [setAddressErr, address, connected]);

  return (
    <AroundedContainer
      style={{ display: show ? 'flex' : 'none' }}
      onSubmit={handleAddAddress}
      css="padding-bottom: 10px;"
    >
      <Img
        src="/icons/zilliqa-logo.svg"
        css="width: 50px;"
      />
      <Text
        align={Sides.center}
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProDemi}
        size={FontSize.sm}
        css="width: 130px;"
      >
        Connect your Zilliqa address
      </Text>
      <Container css="width: 250px;">
        <FieldInput
          sizeVariant={SizeComponent.md}
          error={addressErr}
          placeholder="Zilliqa address (zil1)"
          css="::placeholder { font-size: 15px; }"
          onChange={handleAddressChange}
        />
      </Container>
      <Text
        align={Sides.right}
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProRegular}
        css="font-size: 12px;width: 80%;margin-block-start: -9px;"
      >
        Don't have a&nbsp;
        <Link
          href="https://www.zilliqa.com/about-zil"
          target="blanck"
        >
          Zilliqa address
        </Link>?
      </Text>
      <Button
        variant={ButtonVariants.outlet}
        sizeVariant={SizeComponent.md}
      >
        CONNECT
      </Button>
      <TextWarning fontVariant={Fonts.AvenirNextLTProDemi}>
        DO NOT LINK EXCHANGE ADDRESSES!!!
      </TextWarning>
    </AroundedContainer>
  );
};

export default ZilliqaConnect;
