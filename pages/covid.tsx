import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import BrowserStore from 'store/browser';

import { Text } from 'components/text';
import { KeentodoMore } from 'components/keentodo-more';
import { Img } from 'components/img';

import { PageProp } from 'interfaces';
import {
  FontColors,
  FontSize,
  Fonts,
  Sides
} from 'config';

type CovidPageContainerProp = {
  format: string;
};

const CovidPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  background-color: rgba(56, 89, 255, 0.86);
  background-image: url(/imgs/map.${(props: CovidPageContainerProp) => props.format});
  background-repeat:no-repeat;
  background-position: center center;

  width: 100%;
  height: 100%;
  min-height: 100vh;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;
const Linkbutton = styled(KeentodoMore)`
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0;
  background-color: #526EFF;
  box-shadow: 5px 7px 12px 2px rgba(0,0,0,0.4);
  padding: 2rem;
`;
const LinkContainer = styled.a`
  text-decoration: unset;
  color: unset;
`;
const Illustration = styled(Img)`
  width: 150px;
  height: 200px;

  @media (max-width: 401px) {
    width: 50px;
    height: 100px;
  }
`;

export const CovidPage: NextPage<PageProp> = () => {
  const browserState = Effector.useStore(BrowserStore.store);

  return (
    <CovidPageContainer format={browserState.format}>
      <LinkContainer href="https://nextid.com/covidheroes/">
        <Linkbutton>
          <Illustration src="/imgs/redcross_assets/SVG/asset_3.svg" />
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Recognise COVIDHeroes
          </Text>
          <Text
            fontVariant={Fonts.AvenirNextLTProRegular}
            fontColors={FontColors.white}
            align={Sides.center}
            css="font-size: 14px;"
          >
            Give these heroes and heroines a shout-out by generating a personalised,&nbsp;
            blockchain-powered certificate to express your gratitude.
          </Text>
        </Linkbutton>
      </LinkContainer>
      <LinkContainer href="https://redcross.give.asia/campaign/essentials-delivered-to-migrant-workers/donate?#/amount">
        <Linkbutton>
          <Illustration src="/imgs/redcross_assets/SVG/asset_2.svg" />
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            COVID Relief Fund
          </Text>
          <Text
            fontVariant={Fonts.AvenirNextLTProRegular}
            fontColors={FontColors.white}
            align={Sides.center}
            css="font-size: 14px;"
          >
            Support The Red Cross Singapore in its COVID-19 relief efforts,&nbsp;
            by giving to those who really need it.&nbsp;
          </Text>
        </Linkbutton>
      </LinkContainer>
    </CovidPageContainer>
  );
};

export default CovidPage;
