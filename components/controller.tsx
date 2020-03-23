import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';
import moment from 'moment';

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
  Regex,
  FontColors
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

  const timer = React.useMemo(() => {
    const currentBlock = Number(blockchainState.BlockNum);
    const nextBlockToAction = Number(userState.lastAction);

    if (currentBlock > nextBlockToAction) {
      return 0;
    }

    const ratePerBlock = new Date(Number(blockchainState.rate)).valueOf();
    const amoutBlocks = nextBlockToAction - currentBlock;
    const currentTimer = new Date(amoutBlocks * ratePerBlock).valueOf();

    return new Date().valueOf() + currentTimer;
  }, [blockchainState, userState]);

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
        fontColors={FontColors.white}
      >
        Next action: {timer === 0 ? timer : moment(timer).fromNow()}
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        ZIL per tweet: {fromZil(blockchainState.zilsPerTweet)} ZIL
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
      >
        Balance: {fromZil(userState.balance)} ZIL
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
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
