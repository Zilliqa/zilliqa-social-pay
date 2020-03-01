import React from 'react';
import styled from 'styled-components';

import { Container } from 'src/components/container';
import { TopBar } from 'src/components/top-bar';
import { LeftBar } from 'src/components/left-bar';

const MainPageContainer = styled.main`
  display: grid;
  height: 100vh;
  width: 100vw;

  grid-template-columns: max-content;
  grid-template-rows: max-content;
  grid-template-areas: "left-bar header"
                       "left-bar container";
`;

export const MainPagePath = '/';
export const MainPage: React.FC = () => {
  // const [address, setAddress] = React.useState();

  // const handleLogin = React.useCallback(() => {
  //   window.open(`http://localhost:4000/auth/twitter?address${address}`, "_self");
  // }, [address]);
  // const handleSignInClick = React.useCallback(() => {
  //   window.open("http://localhost:4000/auth/logout", "_self");
  // }, []);
  // const handleInput = React.useCallback((event) => {
  //   const target = event.target as HTMLInputElement;

  //   setAddress(target.value);
  // }, [setAddress]);

  return (
    <MainPageContainer>
      <LeftBar
        profileName="warden"
      />
      <TopBar
        zilAddress="zil1zxvjnkxr3r0rv582rv7u0w07pnh0ap30td4thr"
        profileImg="/default_profile_normal.png"
        profileName="warden"
      />
      <Container area="container">
        dasdsa
      </Container>
    </MainPageContainer>
  );
};

export default MainPage;
