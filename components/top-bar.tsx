import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import * as Effector from 'effector-react';

import EventStore from 'store/event';
import UserStore from 'store/user';
import TwitterStore from 'store/twitter';

import { Text } from 'components/text';
import { Dropdown } from 'components/dropdown';
import { Profile } from 'components/profile';
import ReactTooltip from 'react-tooltip';

import { FontSize, Fonts, FontColors, Events } from 'config';

const TopBarContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  min-height: 60px;
  width: 100%;
  grid-area: header;
  justify-self: center;

  max-width: 1024px;

  padding-top: 15px;
  padding-bottom: 15px;

  @media (max-width: 500px) {
    justify-content: left;
    flex-direction: column;
  }
`;
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  justify-items: center;
`;
const ITEMS = [
  'Settings',
  'Sign out'
];
const TOOLTIP_TYPES = {
  success: 'success',
  warning: 'warning'
};

/**
 * Top bar, show user information as twitter account and Zilliqa address.
 */
export const TopBar: React.FC = () => {
  // Next hooks //
  const router = useRouter();
  // Next hooks //

  const userState = Effector.useStore(UserStore.store);

  /***
   * Triming bech32 address.
   */
  const trimAddress = React.useMemo(() => {
    if (!userState.zilAddress || userState.zilAddress.length < 1) {
      return null;
    }

    const address = userState.zilAddress;
    const _nine = 9;
    const _five = 5;
    const _zero = 0;
    const _len = userState.zilAddress.length;

    return `${address.slice(_zero, _nine)}...${address.slice(_len - _five)}`;
  }, [userState]);
  /**
   * Handle click to Dropdown item.
   */
  const handleClick = React.useCallback((event: string) => {
    switch (event) {
      case ITEMS[0]:
        UserStore.updateUserState(null);
        EventStore.setEvent(Events.Settings);
        break;
      case ITEMS[1]:
        EventStore.signOut(null);
        UserStore.clear();
        TwitterStore.clear();
        EventStore.setEvent(Events.None);
        router.push('/auth');
        break;
      default:
        break;
    }
  }, [router]);

  return (
    <TopBarContainer>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProBold}
        fontColors={FontColors.white}
        data-tip={userState.synchronization ? 'Syncing address...' : 'Address configured.'}
        nowrap
      >
        {trimAddress}
      </Text>
      <ProfileContainer>
        <Profile />
        <Dropdown
          items={ITEMS}
          title={userState.username}
          onClick={handleClick}
        />
      </ProfileContainer>
      {userState.jwtToken ? <ReactTooltip
        type={userState.synchronization ? TOOLTIP_TYPES.warning : TOOLTIP_TYPES.success}
        place="bottom"
        effect="solid"
      /> : null}
    </TopBarContainer>
  );
};

export default TopBar;
