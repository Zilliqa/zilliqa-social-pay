import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';

import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import UserStore from 'store/user';

import { Text } from 'components/text';
import { Search } from 'components/Input';
import { Button } from 'components/button';
import { TwitterConnectContainer } from 'components/twitter-conecter';

import {
  FontSize,
  Fonts,
  SizeComponent,
  Events,
  Regex
} from 'config';
import { fromZil } from 'utils/from-zil';
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(TwitterConnectContainer)`
  padding-left: 15px;
  padding-right: 15px;
  align-items: end;
`;

export const Controller: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);

  const [searchValue, setSearchValue] = React.useState<string | null>(null);

  const handleInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return null;
    }

    const { value } = event.target;

    if (!isNaN(Number(value))) {
      setSearchValue(value);

      return null;
    }

    const urlTestr = new RegExp(Regex.URL);
    const tweeterParse = new RegExp(/https:\/\/twitter\.com\/.+\/status\/(\d+)/gm);

    if (urlTestr.test(value)) {
      let m = null;
      // tslint:disable-next-line: no-conditional-assignment
      while ((m = tweeterParse.exec(value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === tweeterParse.lastIndex) {
          tweeterParse.lastIndex++;
        }

        if (m[1] || m[0]) {
          setSearchValue(m[1]);
          break;
        }
      }

      return null;
    }

    setSearchValue(value);
  }, [setSearchValue, searchValue]);
  const handleSearch = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchValue) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    const tweet = await SearchTweet(
      searchValue,
      userState.jwtToken
    );
    EventStore.reset();
    EventStore.setContent(tweet);

    if (tweet.message) {
      EventStore.setEvent(Events.Error);
      return null;
    }

    EventStore.setEvent(Events.Twitter);
  } , [searchValue, userState]);

  return (
    <ControlContainer onSubmit={handleSearch}>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
      >
        ZIL per tweet: {fromZil(blockchainState.zilsPerTweet)} ZIL
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
      >
        Balance: {fromZil(userState.balance)} ZIL
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
      >
        Hashtag: {blockchainState.hashtag}
      </Text>
      <Search
        sizeVariant={SizeComponent.md}
        css="margin-top: 30px;"
        placeholder="Paste your Tweet link here"
        onChange={handleInput}
      />
      <Button
        sizeVariant={SizeComponent.lg}
        disabled={Boolean(!searchValue)}
        css="margin-top: 10px;"
      >
        Search Tweet
      </Button>
    </ControlContainer>
  );
};
