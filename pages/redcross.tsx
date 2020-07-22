import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import Link from 'next/link';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';
import { Text } from 'components/text';
import { Container } from 'components/container';

import { PageProp } from 'interfaces';
import {
  FontColors,
  FontSize,
  Fonts
} from 'config';

const RedCrossContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(90deg, #7882F3 44.66%, #767FF3 65.62%, #6F77F2 78.6%, #6468F0 89.57%, #5554EE 98.56%, #5352EE 99.55%);
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding-bottom: 1%;

  @media (max-width: 600px) {
    align-items: flex-start;
    padding-top: 20vh;
  }
`;
const Illustration = styled(Img)`
  position: absolute;

  height: auto;
  width: 100%;
  max-width: calc(100vw - 20vw);

  @media (max-width: 400px) {
    width: 90%;
    max-width: calc(100vw - 5vw);
  }
`;
const LinkContainer = styled(Container)`
  position: fixed;
  bottom: 50px;
  right: 50px;

  display: flex;
  align-items: center;

  @media (max-width: 656px) {
    bottom: 200px;
    right: 10px;
  }
`;
const NextPageLink = styled(Text)`
  margin: 0;
  cursor: pointer;
  border-bottom: 2px solid ${FontColors.white};
  z-index: 99;

  @media (max-width: 350px) {
    font-size: 20px;
  }
`;

function getImg(dir: string, format: string, name = 'asset') {
  return `imgs/redcross_assets/${dir}/${name}.${format}`;
}

export const RedCross: NextPage<PageProp> = () => {
  const browserState = Effector.useStore(BrowserStore.store);

  return (
    <React.Fragment>
      <RedCrossContainer>
        <Illustration src={getImg('3x', browserState.format, 'asset')} />
      </RedCrossContainer>
      <Link href="/about">
        <LinkContainer>
          <NextPageLink
            size={FontSize.lg}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Get $ZIL, Send Goodwill
          </NextPageLink>
          <Img
            src="/icons/arrow.svg"
            css="height: 20px;width: 30px;margin-left: 10px;"
          />
        </LinkContainer>
      </Link>
    </React.Fragment>
  );
};

export default RedCross;
