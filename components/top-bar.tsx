import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';
import { Img } from 'components/img';

import { FontSize, Fonts, FontColors } from 'config';

const TopBarContainer = styled.header`
  display: flex;
  justify-content: space-around;
  align-items: center;

  height: 60px;
  width: 100%;
  min-width: 300px;

  border-bottom: 1px solid ${FontColors.gray};

  grid-area: header;

  padding-left: 15px;
  padding-right: 15px;
`;
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 15px;
  align-items: center;
`;
const ProfileImg = styled(Img)`
  border-radius: 50%;
`;

type Prop = {
  profileImg: string;
  profileName: string;
  zilAddress: string;
}

export const TopBar: React.FC<Prop> = ({
  zilAddress,
  profileImg,
  profileName
}) => {
  return (
    <TopBarContainer>
      <Text
        size={FontSize.sm}
        fontVariant={Fonts.AvenirNextLTProBold}
        nowrap
      >
        {zilAddress}
      </Text>
      <ProfileContainer>
        <ProfileImg src={profileImg}/>
        <Text
          size={FontSize.sm}
          fontVariant={Fonts.AvenirNextLTProBold}
          nowrap
        >
          {profileName}
        </Text>
      </ProfileContainer>
    </TopBarContainer>
  );
};
