import React from 'react';
import styled from 'styled-components';

import { Container } from 'components/container';
import { TopBar } from 'components/top-bar';
import { LeftBar } from 'components/left-bar';
import { Search } from 'components/Input';

import { SizeComponent } from 'config';

const LINKS = [
  {
    img: '/icons/twitter.svg',
    name: 'Twittes'
  },
  {
    img: '/icons/setup.svg',
    name: 'Settings'
  }
];

const MainPageContainer = styled.main`
  display: grid;
  height: 100vh;
  width: 100vw;

  grid-template-columns: max-content;
  grid-template-rows: max-content;
  grid-template-areas: "left-bar header"
                       "left-bar container";
`;

export const MainPage: React.FC = () => {
  return (
    <MainPageContainer>
      <LeftBar
        items={LINKS}
        profileName="warden"
      />
      <TopBar
        zilAddress="zil1zxvjnkxr3r0rv582rv7u0w07pnh0ap30td4thr"
        profileImg="/default_profile_normal.png"
        profileName="warden"
      />
      <Container area="container">
        <Search
          sizeVariant={SizeComponent.xl}
          type="search"
        />
      </Container>
    </MainPageContainer>
  );
};

export default MainPage;
