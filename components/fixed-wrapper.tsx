import React from 'react';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { useRouter } from 'next/router';
import ClipLoader from "react-spinners/ClipLoader";

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Modal } from 'components/modal';
import { Card } from 'components/card';
import { FieldInput, Search } from 'components/Input';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { ContainerLoader } from 'components/container-loader';

import {
  ButtonVariants,
  Events,
  SizeComponent,
  FontSize,
  Fonts,
  FontColors
} from 'config';
import { SearchTweet } from 'utils/get-tweets';

const SPINER_SIZE = 150;

export const FixedWrapper: React.FC = () => {
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
  const [foundTweet, setFoundTweet] = React.useState<any | null>();
  const [searchErr, setSearchErr] = React.useState<string | null>();

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
  const handeSearchTweet = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return null;
    }

    const tweet = await SearchTweet(
      event.target.value,
      userState.jwtToken
    );

    if (tweet.message) {
      setSearchErr(tweet.message);

      return null;
    }

    setFoundTweet(tweet);
  }, [userState, setFoundTweet, setSearchErr]);
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
        <Card title="Search tweets.">
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProBold}
          >
            Search your tweet with #zilliqa.
          </Text>
          <Search
            sizeVariant={SizeComponent.lg}
            css="width: 350px;"
            onBlur={handeSearchTweet}
            onChange={() => setSearchErr(null)}
          />
          <Text
            fontColors={FontColors.danger}
            css="text-indent: 15px;"
          >
            {searchErr}
          </Text>
          {foundTweet ? <TwitterTweetEmbed
            screenName={userState.screenName}
            tweetId={foundTweet.id_str}
          /> : null}
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
