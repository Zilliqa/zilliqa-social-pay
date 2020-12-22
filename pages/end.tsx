import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';

import { Container } from 'components/container';
import { Img } from 'components/img';

import { Fonts } from 'config';
import { PageProp } from 'interfaces';

const EndPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;

  background-image: url(/imgs/assets/2x/bg.png);
  background-size: cover;

  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const Background = styled(Img)`
  height: auto;
  width: 100%;
`;
const Background2 = styled(Background)`
  max-width: 1500px;
`;

const StakeLink = styled.a`
  display: flex;
  align-items: center;
  background: #ffffff80;
  color: #2e306d;
  font-family: ${Fonts.AvenirNextLTProRegular};
  font-size: 30px;

  padding: 15px;
  padding-left: 30px;
  padding-right: 30px;

  text-decoration: none;

  :hover {
    background: #fff;
  }
`;
const LogoContainer = styled(Container)`
  position: fixed;
  top: 50px;
  right: 50px;

  display: flex;
  align-items: center;

  @media (max-width: 656px) {
    right: auto;
  }
`;

export const EndPage: NextPage<PageProp> = () => {
  return (
    <EndPageContainer>
      <LogoContainer>
        <Img
          src="/imgs/assets/2x/logo.svg"
          css="height: 90px;width: 300px;"
        />
      </LogoContainer>
      <Background2
        css="top: 15%;"
        src="/imgs/assets/2x/Hashtag.svg"
      />
      <StakeLink href="https://www.travala.com/payment/zilliqa-zil">
        Book your 2021 holidays on Travala with $ZIL now!
        <svg
          width="56"
          height="28"
          viewBox="0 0 56 28"
          fill="none"
          style={{ marginLeft: '15px' }}
        >
          <path d="M55 12.1L43.6 0.80003C43.2022 0.402205 42.6626 0.178711 42.1 0.178711C41.5374 0.178711 40.9978 0.402205 40.6 0.80003C40.2022 1.19785 39.9786 1.73742 39.9786 2.30003C39.9786 2.86264 40.2022 3.40221 40.6 3.80003L48.2 11.4H2.19995C1.61647 11.4 1.05699 11.6318 0.644409 12.0444C0.231829 12.457 0 13.0166 0 13.6C0 14.1835 0.231829 14.7431 0.644409 15.1557C1.05699 15.5682 1.61647 15.8 2.19995 15.8H48.2L40.6 23.4C40.2022 23.7979 39.9786 24.3374 39.9786 24.9C39.9786 25.4626 40.2022 26.0022 40.6 26.4C40.9978 26.7979 41.5374 27.0214 42.1 27.0214C42.6626 27.0214 43.2022 26.7979 43.6 26.4L55 15.1C55.3796 14.6928 55.5907 14.1568 55.5907 13.6C55.5907 13.0433 55.3796 12.5073 55 12.1V12.1Z" fill="#2E306D"/>
        </svg>
      </StakeLink>
    </EndPageContainer>
  );
};

export default EndPage;
