import React from 'react';
import { validation } from '@zilliqa-js/util';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import EventStore from 'store/event';
import BrowserStore from 'store/browser';

import { Text } from 'components/text';
import { Img } from 'components/img';
import { FieldInput } from 'components/Input';
import { Container } from 'components/container';
import { Button } from 'components/button';
import { AroundedContainer } from 'components/rounded-container';
import { TextWarning } from 'components/warning-text';
import { Link } from 'components/link';
import Recaptcha from 'react-recaptcha';

import {
  FontColors,
  Fonts,
  FontSize,
  Sides,
  ButtonVariants,
  SizeComponent,
  Events
} from 'config';
import ERROR_CODES from 'config/error-codes';

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
  const browserState = Effector.useStore(BrowserStore.store);

  // State for error handlers.
  const [addressErr, setAddressErr] = React.useState<string | null | undefined>(null);
  // State for address in bech32 (zil1).
  const [address, setAddress] = React.useState<string | null>(null);
  const [recaptchaKey, setRecaptchaKey] = React.useState<string>('');

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
      jwt: userState.jwtToken,
      recaptchaKey
    });

    if (result.code === ERROR_CODES.unauthorized) {
      EventStore.reset();
      EventStore.signOut(null);
      UserStore.clear();

      return null;
    }

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
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProRegular}
        css="font-size: 12px;width: 80%;margin-block-start: -9px;text-indent: 10px;"
      >
        Don’t have a $ZIL address?&nbsp;
        <Link
          href="https://blog.zilliqa.com/tipping-zil-on-telegram-94c10c776f0a"
          target="blanck"
        >
          Click here!
        </Link>
      </Text>
      {Boolean(recaptchaKey) ?
        (
          <Button
            variant={ButtonVariants.outlet}
            sizeVariant={SizeComponent.md}
          >
            CONNECT
          </Button>
        )
          :
        (
          <Recaptcha
            sitekey={browserState.recaptchaKey}
            verifyCallback={setRecaptchaKey}
          />
        )
      }
      <TextWarning fontVariant={Fonts.AvenirNextLTProDemi}>
        DO NOT LINK EXCHANGE ADDRESSES!!!
      </TextWarning>
    </AroundedContainer>
  );
};

export default ZilliqaConnect;
