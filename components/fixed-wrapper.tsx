import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ClipLoader from 'react-spinners/ClipLoader';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';
import { NotificationContainer, NotificationManager } from 'react-notifications';

import EventStore from 'store/event';
import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BlockchainStore from 'store/blockchain';

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
  FontColors,
  FontSize,
  Fonts
} from 'config';
import { timerCalc } from 'utils/timer';
import { addTweet } from 'utils/update-tweets';

const TweetContainer = styled.div`
  display: grid;
  justify-items: center;
`;

const SPINER_SIZE = 150;
const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;

export const FixedWrapper: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  // Effector hooks //
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);
  // Effector hooks //

  // React hooks //
  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string>(userState.zilAddress);

  const canCallAction = React.useMemo(() => {
    if (Number(userState.lastAction) > Number(blockchainState.BlockNum)) {
      return false;
    }

    return true;
  }, [userState]);
  const timer = React.useMemo(
    () => timerCalc(blockchainState, userState),
    [blockchainState, userState]
  );

  const handleAddressChange = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    setAddress(address);

    if (address === userState.zilAddress) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });
    EventStore.reset();
  }, [address, validation, setAddressErr, addressErr]);
  const handleChangeAddress = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAddressErr(null);

    if (!value) {
      return null;
    }

    setAddress(value);
  }, [setAddressErr, setAddress]);

  const handlePay = React.useCallback(async () => {
    EventStore.setEvent(Events.Load);
    const result = await addTweet(userState.jwtToken, eventState.content);

    if (result.message === 'Created') {
      await TwitterStore.getTweets(null);

      NotificationManager.info('Tweet added!');
    }

    EventStore.reset();
  }, [addTweet, EventStore, userState, eventState, TwitterStore]);

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
          {timer !== 0 ? (
            <Text
              fontColors={FontColors.white}
              size={FontSize.sm}
            >
              You can participate: {moment(timer).fromNow()}
            </Text>
          ) : null}
          <form onSubmit={handleAddressChange}>
            <FieldInput
              defaultValue={address}
              sizeVariant={SizeComponent.md}
              error={addressErr}
              disabled={userState.synchronization || !canCallAction}
              css="font-size: 15px;width: 350px;"
              onChange={handleChangeAddress}
            />
            <Button
              sizeVariant={SizeComponent.lg}
              variant={ButtonVariants.primary}
              disabled={Boolean(!canCallAction || addressErr || !address || (address === userState.zilAddress))}
              css="margin-top: 10px;"
            >
              Change address
            </Button>
          </form>
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
              {timer === 0 ? (
                <Button
                  sizeVariant={SizeComponent.lg}
                  variant={ButtonVariants.primary}
                  css="margin-top: 30px;"
                  onClick={handlePay}
                >
                  Pay
                </Button>
              ) : (
                <Text
                  size={FontSize.sm}
                  fontVariant={Fonts.AvenirNextLTProDemi}
                  fontColors={FontColors.white}
                >
                  You can participate: {moment(timer).fromNow()}
                </Text>
              )}
            </TweetContainer>
          ) : null}
        </Card>
      </Modal>
      <Modal
        show={eventState.current === Events.Error}
        onBlur={() => EventStore.reset()}
      >
        <Card title="Error">
          {Boolean(eventState.content && eventState.content.message) ? <Text
            size={FontSize.md}
            fontColors={FontColors.danger}
            fontVariant={Fonts.AvenirNextLTProBold}
          >
            {eventState.content.message}
          </Text> : null}
        </Card>
      </Modal>
      <ContainerLoader show={eventState.current === Events.Load}>
        <ClipLoader
          size={SPINER_SIZE}
          color={FontColors.info}
          loading={eventState.current === Events.Load}
        />
      </ContainerLoader>
      {userState.jwtToken ? <NotificationContainer /> : null}
    </React.Fragment>
  );
};
