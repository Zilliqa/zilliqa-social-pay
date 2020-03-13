import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { useRouter } from 'next/router';
import ClipLoader from 'react-spinners/ClipLoader';
import { useMediaQuery } from 'react-responsive';

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Modal } from 'components/modal';
import { Card } from 'components/card';
import { FieldInput } from 'components/Input';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { ContainerLoader } from 'components/container-loader';

import {
  ButtonVariants,
  Events,
  SizeComponent,
  FontColors
} from 'config';

const TweetContainer = styled.div`
  display: grid;
  justify-items: center;
`;

const SPINER_SIZE = 150;
const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;

export const FixedWrapper: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' })
  // Next hooks //
  const router = useRouter();
  // Next hooks //

  // Effector hooks //
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);
  // Effector hooks //

  // React hooks //
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

    if (address === userState.zilAddress) {
      return null;
    }

    await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });
  }, [address, validation, setAddressErr, addressErr]);
  const handleSignOut = React.useCallback(() => {
    EventStore.signOut(null);
    UserStore.clear();
    EventStore.setEvent(Events.None);
    router.push('/auth');
  }, [router]);

  React.useEffect(() => {
    if (!address || address.length < 1) {
      setAddress(userState.zilAddress);
    }
  }, [address, setAddress, userState]);
  // React hooks //

  return (
    <React.Fragment>
      <Modal
        show={eventState.current === Events.Settings}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Settings">
          <Text>
            Your Zilliqa address
          </Text>
          <FieldInput
            defaultValue={address}
            sizeVariant={SizeComponent.md}
            error={addressErr}
            disabled={userState.zilAddress && userState.zilAddress.includes('padding')}
            css="font-size: 15px;width: 350px;"
            onBlur={handleAddressChange}
            onChange={() => setAddressErr(null)}
          />
          <Button
            sizeVariant={SizeComponent.md}
            variant={ButtonVariants.danger}
            css="margin-top: 30px;"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </Card>
      </Modal>
      <Modal
        show={eventState.current === Events.Twitter}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Found tweet">
          {Boolean(eventState.content && eventState.content.id_str) ? (
            <TweetContainer>
              <TwitterTweetEmbed
                screenName={userState.screenName}
                tweetId={eventState.content.id_str}
                options={{
                  width: isTabletOrMobile ? WIDTH_MOBILE : WIDTH_DEFAULT
                }}
              />
              <Button
                sizeVariant={SizeComponent.lg}
                variant={ButtonVariants.primary}
                css="margin-top: 30px;"
              >
                Pay
              </Button>
            </TweetContainer>
          ) : null}
        </Card>
      </Modal>
      <ContainerLoader show={eventState.current === Events.Load}>
        <ClipLoader
          size={SPINER_SIZE}
          color={FontColors.info}
          loading={eventState.current === Events.Load}
        />
      </ContainerLoader>
    </React.Fragment>
  );
};
