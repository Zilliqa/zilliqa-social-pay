import React from 'react';
import styled from 'styled-components';

import { Container } from 'src/components/container';
import { Text } from 'src/components/text';

import { FontSize, Fonts, FontColors, Sides } from 'src/config';

export const LeftBarContainer = styled.header`
  height: 100%;
  width: 250px;

  border-right: 1px solid ${FontColors.gray};

  grid-area: left-bar;
`;
const ProfileContainer = styled(Container)`
  width: 100%;
  height: 100%;

  padding: 30px;

  background: url(/imgs/circles.svg) no-repeat;
`;

type Prop = {
  profileName: string;
}

export const LeftBar: React.FC<Prop> = ({
  profileName
}) => {
  return (
    <LeftBarContainer>
      <ProfileContainer>
        <Text
          size={FontSize.lg}
          fontColors={FontColors.white}
          fontVariant={Fonts.AvenirNextLTProBold}
          align={Sides.center}
        >
          SocialPay
        </Text>
        <Text
          size={FontSize.lg}
          fontColors={FontColors.white}
          fontVariant={Fonts.AvenirNextLTProDemi}
          align={Sides.center}
        >
          Hello
        </Text>
        <Text
          size={FontSize.md}
          fontColors={FontColors.white}
          fontVariant={Fonts.AvenirNextLTProRegular}
          align={Sides.center}
          nowrap
        >
          {profileName}
        </Text>
      </ProfileContainer>
    </LeftBarContainer>
  );
};