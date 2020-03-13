import React from 'react';
import * as Effector from 'effector-react';

import BlockchainStore from 'store/blockchain';

import { Jumbotron } from 'components/jumbotron';
import { Alert } from 'components/alert';
import { Text } from 'components/text';
import { Container } from 'components/container';
import { Search } from 'components/Input';
import { Button } from 'components/button';

import { FontSize, Fonts, SizeComponent, AlertVariants } from 'config';
import { fromZil } from 'utils/from-zil';

export const Controller: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);

  const [searchValue, setSearchValue] = React.useState<string | null>(null);

  const handeSearch = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(searchValue);
  } , [searchValue]);

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
      <form onSubmit={handeSearch}>
        <Search
          sizeVariant={SizeComponent.md}
          css="background-color: #e9ecef;color: #fff;margin-top: 30px;"
          placeholder="Input your tweet link or tweet id."
          onChange={(event) => setSearchValue(event.target.value)}
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
