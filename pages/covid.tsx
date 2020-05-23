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
  Fonts
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
`;
const LinkContainer = styled.a`
  text-decoration: unset;
  color: unset;
`;
const Illustration = styled(Img)`
  width: 100px;
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
          <Illustration src="/icons/medal.svg"/>
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Recognice COVIDHeroes
          </Text>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            You can choose to generate a meaningful blockchain certificate of appreciation, which you can share.
          </Text>
        </Linkbutton>
      </LinkContainer>
      <LinkContainer href="https://redcross.give.asia/campaign/essentials-delivered-to-migrant-workers/donate?#/amount">
        <Linkbutton>
          <Illustration src="/icons/hand.svg" />
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            COVID Relief fund
          </Text>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Support The Red Cross Singapore in it's COVID relief efforts by `giving` to those who really need it.
          </Text>
        </Linkbutton>
      </LinkContainer>
    </CovidPageContainer>
  );
};

export default CovidPage;
