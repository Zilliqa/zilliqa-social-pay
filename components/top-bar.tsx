import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import EventStore from 'store/event';
import UserStore from 'store/user';

import { Text } from 'components/text';
import { Img } from 'components/img';
import { Dropdown } from 'components/dropdown';

import { FontSize, Fonts, FontColors, Events } from 'config';

const TopBarContainer = styled.header`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;

  min-height: 60px;
  width: 100%;

  border-bottom: 1px solid ${FontColors.gray};

  grid-area: header;

  padding: 15px;
`;
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  justify-items: center;
`;
const ProfileImg = styled(Img)`
  border-radius: 50%;
`;

type Prop = {
  profileImg: string;
  profileName: string;
  zilAddress: string;
};

const ITEMS = [
  'Settings',
  'SignOut'
];

export const TopBar: React.FC<Prop> = ({
  zilAddress,
  profileImg,
  profileName
}) => {
  // Next hooks //
  const router = useRouter();
  // Next hooks //

  const handleClick = React.useCallback((event: string) => {
    switch (event) {
      case ITEMS[0]:
        EventStore.setEvent(Events.Settings);
        break;
      case ITEMS[1]:
        EventStore.signOut(null);
        UserStore.clear();
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
        css="width: 200px;"
        nowrap
      >
        {zilAddress}
      </Text>
      <ProfileContainer>
        <ProfileImg src={profileImg}/>
        <Dropdown
          items={ITEMS}
          onClick={handleClick}
        >
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProBold}
            css="width: 200px;"
            nowrap
          >
            {profileName}
          </Text>
        </Dropdown>
      </ProfileContainer>
    </TopBarContainer>
  );
};
