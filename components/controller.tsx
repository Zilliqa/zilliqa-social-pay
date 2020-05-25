import React from 'react';
import * as Effector from 'effector-react';
import styled from 'styled-components';

import BlockchainStore from 'store/blockchain';
import EventStore from 'store/event';
import UserStore from 'store/user';
import TwitterStore from 'store/twitter';

import { Text } from 'components/text';
import { ProgressCircle } from 'components/progress-circle';
import { AroundedContainer } from 'components/rounded-container';
import { Img } from 'components/img';
import { Input, InputIcons } from 'components/Input';
import { Button } from 'components/button';
import { Container } from 'components/container';
import { KeentodoMore } from 'components/keentodo-more';
import { TwitterHashtagButton } from 'react-twitter-embed';

import {
  FontSize,
  Fonts,
  Events,
  FontColors,
  SizeComponent,
  ButtonVariants
} from 'config';
import { fromZil } from 'utils/from-zil';
import { SearchTweet } from 'utils/get-tweets';

const ControlContainer = styled(AroundedContainer)`
  padding: 30px;
  margin-top: 7px;
  align-items: flex-start;

  @media (max-width: 1023px) {
    margin-bottom: 30px;
    margin: 0;
  }
`;
const DashboardContainer = styled(Container)`
  position: absolute;
  transform: translate(150%, -125%);

  @media (max-width: 440px) {
    position: relative;
    transform: none;
  }
`;
const Link = styled.a`
  text-decoration: unset;
  color: ${FontColors.white};
  font-family: ${Fonts.AvenirNextLTProDemi};
  border-bottom: 1px solid ${FontColors.white};
`;

/**
 * Controller is component show information about
 * contract, blockchain, user account.
 * @example
 * import { Controller } from 'components/controller';
 * <Controller />
 */
export const Controller: React.FC = () => {
  const blockchainState = Effector.useStore(BlockchainStore.store);
  const userState = Effector.useStore(UserStore.store);
  const twitterState = Effector.useStore(TwitterStore.store);

  const [value, setValue] = React.useState<string>('');
  const [placeholder, setPlaceholder] = React.useState<string>();
  const [disabled, setDisabled] = React.useState<boolean>();
  const [icon, setIcon] = React.useState<InputIcons>(InputIcons.timer);

  /**
   * Validation and parse tweet url or ID, before send to server and blockchain.
   * @param event - HTMLInput event.
   */
  const handleInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setValue('');
      return null;
    }

    let inputValue = event.target.value;

    // If user pass tweet ID.
    if (!isNaN(Number(inputValue))) {
      setValue(inputValue);

      return null;
    }

    inputValue = inputValue.replace(/\?.*/gm, '');

    // Parse and search tweet ID.
    const foundTweetId = inputValue
      .split('/')
      .filter(Boolean)
      .find((el) => Number.isInteger(Number(el)));

    if (!foundTweetId) {
      return null;
    }

    // If value is valid than update `value` state.
    setValue(foundTweetId);
  }, [setValue]);

  /**
   * Handle when form has been submited and send tweet ID to server.
   * @param event - HTMLForm event.
   */
  const handleSearch = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    // Send to server tweet ID (`value`).
    const result = await SearchTweet(
      value,
      userState.jwtToken
    );
    EventStore.reset();

    if (result.message) {
      EventStore.setContent(result);
      EventStore.setEvent(Events.Error);

      return null;
    }

    EventStore.setContent(result);
    EventStore.setEvent(Events.Twitter);
  }, [value, userState]);

  React.useEffect(() => {
    const tweetClaiming = twitterState.tweets.some(
      (t) => Boolean(t.claimed && !t.approved && !t.rejected)
    );

    if (tweetClaiming) {
      setValue('');
      setPlaceholder('Claiming tweet in progress...');
      setDisabled(true);
      setIcon(InputIcons.refresh);
    } else if (userState.synchronization) {
      setValue('');
      setPlaceholder('Waiting for address to sync...');
      setDisabled(true);
      setIcon(InputIcons.refresh);
    } else if (Boolean(blockchainState.dayTimer)) {
      setValue('');
      setPlaceholder(`You can participate: ${blockchainState.dayTimer}`);
      setDisabled(true);
      setIcon(InputIcons.timer);
    } else if (!Boolean(blockchainState.dayTimer) && !userState.synchronization) {
      setDisabled(false);
      setPlaceholder('Paste the link to your tweet here');
      setIcon(InputIcons.search);
    }
  }, [
    setIcon,
    setDisabled,
    setPlaceholder,
    setValue,
    twitterState.tweets,
    userState.synchronization,
    blockchainState.dayTimer,
    blockchainState.dayTimer
  ]);

  /**
   * Handle click to reload icon.
   * Just update user information.
   */
  const handleUpdateUser = React.useCallback(async () => {
    EventStore.setEvent(Events.Load);
    await UserStore.updateUserState(null);
    EventStore.reset();
  }, [UserStore]);

  return (
    <Container>
      <ControlContainer onSubmit={handleSearch}>
        <DashboardContainer>
          <ProgressCircle
            pct={twitterState.verifiedCount}
            count={twitterState.count}
          />
          <Text
            size={FontSize.sm}
            fontColors={FontColors.white}
          >
            Verified Tweets
        </Text>
        </DashboardContainer>
        <Text
          size={FontSize.md}
          fontVariant={Fonts.AvenirNextLTProRegular}
          fontColors={FontColors.white}
        >
          Dashboard
      </Text>
        <Text
          size={FontSize.xs}
          fontVariant={Fonts.AvenirNextLTProRegular}
          fontColors={FontColors.gray}
        >
          BALANCE
        <Text
            fontVariant={Fonts.AvenirNextLTProBold}
            fontColors={FontColors.white}
            css="font-size: 15px;"
          >
            {fromZil(userState.balance)} ZIL <Img
              src="/icons/refresh.svg"
              css="cursor: pointer;font-size: 15px;"
              onClick={handleUpdateUser}
            />
          </Text>
        </Text>
        <Text
          size={FontSize.xs}
          fontVariant={Fonts.AvenirNextLTProRegular}
          fontColors={FontColors.gray}
        >
          $ZIL PER TWEET
        <Text
            fontVariant={Fonts.AvenirNextLTProBold}
            fontColors={FontColors.white}
            css="font-size: 15px;"
          >
            {fromZil(blockchainState.zilsPerTweet)} $ZIL
        </Text>
        </Text>
        <Container css="display: flex;align-items: center;justify-content: space-between;width: 100%;">
          {blockchainState.hashtag ? (
            <TwitterHashtagButton
              tag={'ZILCovidHeroes'}
              options={{
                size: 'large',
                text: blockchainState.hashtagText
              }}
            />
          ) : null}
        </Container>
        <Input
          sizeVariant={SizeComponent.md}
          value={value}
          icon={icon}
          disabled={disabled}
          onChange={handleInput}
          placeholder={placeholder}
          css="font-size: 12px;height: 40px;"
        />
        {!disabled ? (
          <Button
            sizeVariant={SizeComponent.md}
            variant={ButtonVariants.outlet}
            css="margin-top: 10px;"
          >
            Search
          </Button>
        ) : null}
      </ControlContainer>
      <Link
        href="/covid"
        target="_blanck"
      >
        <KeentodoMore css="justify-content: space-around;">
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProRegular}
            fontColors={FontColors.white}
            css="width: 150px;"
          >
            Keen to do more?
        </Text>
          <Img
            src="/icons/group.svg"
            css="width: 70px;height: auto;"
          />
        </KeentodoMore>
      </Link>
    </Container>
  );
};

export default Controller;
