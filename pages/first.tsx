import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import Link from 'next/link';

import BrowserStore from 'store/browser';

import { Img } from 'components/img';
import { Container } from 'components/container';

import { PageProp } from 'interfaces';

const PageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #001623;
  background-repeat: space;
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

  cursor: pointer;
  display: flex;
  align-items: center;

  @media (max-width: 656px) {
    bottom: 200px;
    right: 10px;
  }
`;
const LeftLinkContainer = styled(LinkContainer)`
  left: 50px;
  right: auto;

  @media (max-width: 656px) {
    bottom: 100px;
  }
`;

function getImg(dir: string, format: string, name = 'asset') {
  return `imgs/assets/${dir}/${name}.${format}`;
}

export const RedCross: NextPage<PageProp> = () => {
  const browserState = Effector.useStore(BrowserStore.store);

  return (
    <React.Fragment>
      <PageContainer>
        <Illustration
          src="/imgs/assets/paperplanes.svg"
          css="top: 15%;"
        />
        <Illustration
          src={getImg('3x', 'svg', 'hashtag')}
          css="top: 10%;"
        />
        <Illustration
          src={getImg('3x', browserState.format, 'asset')}
          css="top: 15%;"
        />
      </PageContainer>
      <LeftLinkContainer>
        <Img
          src="/imgs/assets/travala.svg"
          css="height: 90px;width: 300px;"
        />
      </LeftLinkContainer>
      <Link href="/auth">
        <LinkContainer>
          <Img
            src="/imgs/assets/button.svg"
            css="height: 100px;width: 300px;"
          />
        </LinkContainer>
      </Link>
    </React.Fragment>
  );
};

export default RedCross;
