import React from 'react';
import * as Effector from 'effector-react';
import { validation } from '@zilliqa-js/util';
import { TwitterTweetEmbed } from 'react-twitter-embed';

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Modal } from 'components/modal';
import { Card } from 'components/card';
import { FieldInput, Search } from 'components/Input';
import { Text } from 'components/text';

import { Events, SizeComponent, FontSize, Fonts, FontColors } from 'config';
import { SearchTweet } from 'utils/get-tweets';

export const FixedWrapper: React.FC = () => {
  const eventState = Effector.useStore(EventStore.store);
  const userState = Effector.useStore(UserStore.store);

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
        <Card title="Settings">
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
    </React.Fragment>
  );
};
