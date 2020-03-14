import React from 'react';
import * as Effector from 'effector-react';

import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import UserStore from 'store/user';

import { Jumbotron } from 'components/jumbotron';
import { Alert } from 'components/alert';
import { Text } from 'components/text';
import { Container } from 'components/container';
import { Search } from 'components/Input';
import { Button } from 'components/button';

import {
  FontSize,
  Fonts,
  SizeComponent,
  AlertVariants,
  Events,
  Regex
} from 'config';
import { fromZil } from 'utils/from-zil';
import { SearchTweet } from 'utils/get-tweets';

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
    <Jumbotron css="min-width: 320px;margin-top: 40px;">
      <Container css="display: flex;justify-content: space-between;">
        <Alert variant={AlertVariants.info}>
          <Text
            size={FontSize.xs}
            fontVariant={Fonts.AvenirNextLTProDemi}
          >
            Wallet balance:
          </Text>
          <Text>
            {fromZil(blockchainState.zilsPerTweet)} ZIL.
          </Text>
        </Alert>
        <Alert variant={AlertVariants.info}>
          <Text
            size={FontSize.xs}
            fontVariant={Fonts.AvenirNextLTProDemi}
          >
            Total Tweets made:
          </Text>
          <Text>
            1.001
          </Text>
        </Alert>
      </Container>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        css="white-space: nowrap;"
      >
        Blocks till next claim: {blockchainState.blocksPerDay}
      </Text>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProDemi}
        css="white-space: nowrap;"
      >
        Current block: {blockchainState.NumDSBlocks}
      </Text>
      <form onSubmit={handleSearch}>
        <Search
          sizeVariant={SizeComponent.md}
          css="background-color: #e9ecef;color: #000;margin-top: 30px;"
          placeholder="Input your tweet link or tweet id."
          onChange={handleInput}
        />
        <Button
          sizeVariant={SizeComponent.lg}
          disabled={Boolean(!searchValue)}
          css="margin-top: 10px;"
        >
          Search Tweet
        </Button>
      </form>
    </Jumbotron>
  );
};
