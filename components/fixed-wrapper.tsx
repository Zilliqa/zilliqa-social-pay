import React from 'react';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import ClipLoader from 'react-spinners/ClipLoader';
import { useMediaQuery } from 'react-responsive';
import moment from 'moment';

import EventStore from 'store/event';
import UserStore from 'store/user';
import TwitterStore from 'store/twitter';
import BrowserStore from 'store/browser';
import BlockchainStore from 'store/blockchain';
import NotificationStore from 'store/notification';

import { Modal } from 'components/modal';
import { Img } from 'components/img';
import { FieldInput } from 'components/Input';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { ContainerLoader } from 'components/container-loader';
import { Container } from 'components/container';
import {
  NotificationsControl,
  NotificationWarning,
  NotificationSuccess
} from 'components/notification-control';

import {
  ButtonVariants,
  Events,
  SizeComponent,
  FontColors,
  FontSize,
  Fonts,
  Sides
} from 'config';
import { timerCalc } from 'utils/timer';
import { addTweet } from 'utils/update-tweets';

const SPINER_SIZE = 150;
const WIDTH_MOBILE = 250;
const WIDTH_DEFAULT = 450;
const SLEEP = 10;

/**
 * Container for modals and any componets with fixed postion.
 */
export const FixedWrapper: React.FC = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });

  // Effector hooks //
  const browserState = Effector.useStore(BrowserStore.store);
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);
  const blockchainState = Effector.useStore(BlockchainStore.store);
  // Effector hooks //

  // React hooks //*
  // State for address error handle.
  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  // State for Zilliqa address in bech32 (zil1) format.
  const [address, setAddress] = React.useState<string>(userState.zilAddress);
  // State for check is tablet or mobile width.
  const [twitterWidth] = React.useState(isTabletOrMobile ? WIDTH_MOBILE : WIDTH_DEFAULT);
  const [placeholder, setPlaceholder] = React.useState<string>();
  const [disabledAddress, setDisabledAddress] = React.useState<boolean>();
  /**
   * Calculate the time for next action.
   */
  const timerPerWeeks = React.useMemo(
    () => timerCalc(
      blockchainState,
      userState,
      twitterState.lastBlockNumber,
      Number(blockchainState.blocksPerWeek)
    ),
    [
      blockchainState,
      blockchainState.BlockNum,
      twitterState.lastBlockNumber,
      userState
    ]
  );
  const timerDay = React.useMemo(
    () => timerCalc(
      blockchainState,
      userState,
      twitterState.lastBlockNumber,
      Number(blockchainState.blocksPerDay)
    ),
    [
      blockchainState,
      blockchainState.BlockNum,
      twitterState.lastBlockNumber,
      userState
    ]
  );

  /**
   * Handle submit (Zilliqa address) form.
   * @param event HTMLForm event.
   */
  const handleAddressChange = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      setAddressErr('This field is required.');

      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorect address format.');

      return null;
    } else if (address === userState.zilAddress) {
      setAddressErr(`You're already connected with this address`);

      return null;
    }

    setAddress(address);

    // Send to server for validation and update address.
    const result = await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });

    if (result.message && result.message !== 'ConfiguredUserAddress') {
      setAddressErr(result.message);

      return null;
    }

    NotificationStore.addNotifly(
      <NotificationWarning>
        <Img
          src="/icons/danger.svg"
          css="height: 30px;width: 30px;"
        />
        Syncing address...
      </NotificationWarning>
    );

    EventStore.reset();
  }, [address, validation, setAddressErr, addressErr, userState]);
  /**
   * Handle input address for Input component.
   * @param event HTMLInput event.
   */
  const handleChangeAddress = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setAddressErr(null);

    if (!value) {
      return null;
    }

    setAddress(value);
  }, [setAddressErr, setAddress]);
  /**
   * Handle send tweet to server for validation and verification.
   */
  const handlePay = React.useCallback(async () => {
    EventStore.setEvent(Events.Load);
    const result = await addTweet(userState.jwtToken, eventState.content);

    BlockchainStore.updateBlockchain(null);

    TwitterStore.setShowTwitterTweetEmbed(false);

    setTimeout(() => TwitterStore.setShowTwitterTweetEmbed(true), SLEEP);

    if (result.message.includes('Added')) {
      TwitterStore.add(result.tweet);

      NotificationStore.addNotifly(
        <NotificationSuccess>
          Tweet added!
        </NotificationSuccess>
      );
    }

    EventStore.reset();
  }, [addTweet, EventStore, userState, eventState, TwitterStore]);

  React.useEffect(() => {
    if (timerPerWeeks > 0) {
      setPlaceholder(`You can change address: ${moment(timerPerWeeks).fromNow()}`);
      setDisabledAddress(true);
      setAddress('');
    } else if (userState.synchronization) {
      setPlaceholder('Waiting for address to sync...');
      setDisabledAddress(true);
      setAddress('');
    } else if (timerPerWeeks === 0 && !userState.synchronization && !address) {
      setAddress(userState.zilAddress);
      setDisabledAddress(false);
    }
  }, [
    address,
    setAddress,
    userState,
    setPlaceholder,
    timerPerWeeks,
    disabledAddress
  ]);
  // React hooks //

  return (
    <React.Fragment>
      <Modal
        show={eventState.current === Events.Settings}
        onBlur={() => EventStore.reset()}
      >
        <form onSubmit={handleAddressChange}>
          <Container>
            <Img
              src="/icons/warn.svg"
              css="height: 30px;width: 30px;"
            />
            <Text
              size={FontSize.sm}
              fontVariant={Fonts.AvenirNextLTProDemi}
              fontColors={FontColors.warning}
            >
                DO NOT LINK EXCHANGE ADDRESSES!!!
            </Text>
          </Container>
          <FieldInput
            defaultValue={address}
            sizeVariant={SizeComponent.lg}
            error={addressErr}
            placeholder={placeholder}
            disabled={disabledAddress}
            css="font-size: 15px;width: 300px;"
            onChange={handleChangeAddress}
          />
          <Button
            sizeVariant={SizeComponent.lg}
            variant={ButtonVariants.outlet}
            disabled={Boolean(disabledAddress)}
            css="margin-top: 10px;"
          >
            Change address
          </Button>
        </form>
      </Modal>
      <Modal
        show={eventState.current === Events.Twitter}
        onBlur={() => EventStore.reset()}
      >
        {Boolean(eventState.content && eventState.content.id_str) ? (
          <Container css={`display: grid;width: ${twitterWidth}px`}>
            <TwitterTweetEmbed
              screenName={userState.screenName}
              tweetId={eventState.content.id_str}
              options={{
                width: twitterWidth
              }}
            />
            {timerDay === 0 ? (
              <Button
                sizeVariant={SizeComponent.lg}
                variant={ButtonVariants.primary}
                css="justify-self: center;margin-top: 30px;"
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
                  You can participate: {moment(timerDay).fromNow()}
                </Text>
              )}
          </Container>
        ) : null}
      </Modal>
      <Modal
        show={eventState.current === Events.Error}
        onBlur={() => EventStore.reset()}
      >
        <Container css="display: grid;justify-items: center;">
          <Img
            src={`/imgs/error.${browserState.format}`}
            css="width: 200px;height: auto;"
          />
          <Text
            size={FontSize.lg}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Error
          </Text>
          {Boolean(eventState.content && eventState.content.message) ? <Text
            size={FontSize.sm}
            fontColors={FontColors.white}
            fontVariant={Fonts.AvenirNextLTProBold}
            align={Sides.center}
            css="min-width: 300px;"
          >
            {eventState.content.message}
          </Text> : null}
        </Container>
      </Modal>
      <ContainerLoader show={eventState.current === Events.Load}>
        <ClipLoader
          size={SPINER_SIZE}
          color={FontColors.info}
          loading={eventState.current === Events.Load}
        />
      </ContainerLoader>
      <NotificationsControl />
    </React.Fragment>
  );
};
