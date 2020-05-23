import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import { useMediaQuery } from 'react-responsive';
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

  @media (max-width: 400px) {
    align-items: flex-start;
    padding-top: 20vh;
  }
`;
const RedCrossLogo = styled(Img)`
  position: fixed;
  left: 50px;
  bottom: 50px;

  height: 80px;
  width: auto;

  @media (max-width: 400px) {
    left: 10px;
  }
`;
const NextLogo = styled(RedCrossLogo)`
  left: 213px;
  width: 150px;
  height: auto;

  @media (max-width: 400px) {
    left: auto;
    right: 10px;
  }
`;
const Illustration = styled(Img)`
  position: absolute;

  height: auto;
  width: 100%;
  max-width: 900px;

  @media (max-width: 400px) {
    width: 90%;
  }
`;
const HashTag = styled(Img)`
  position: absolute;
  z-index: 5;
  width: 100%;

  max-width: 900px;
  height: 300px;

  @media (max-width: 400px) {
    width: 90%;
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
  }
`;
const NextPageLink = styled(Text)`
  margin: 0;
  cursor: pointer;
  border-bottom: 2px solid #fff;
`;

function getImg(dir: string, format: string, name = 'asset') {
  return `imgs/redcross_assets/${dir}/${name}.${format}`;
}

export const RedCross: NextPage<PageProp> = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 446px)' });

  const browserState = Effector.useStore(BrowserStore.store);

  const dirName = React.useMemo(() => {
    if (isTabletOrMobile) {
      return '1x';
    }

    return '3x';
  }, [isTabletOrMobile]);

  return (
    <React.Fragment>
      <RedCrossLogo src={getImg('SVG', 'svg', 'asset_2')} />
      <NextLogo src={getImg('SVG', 'svg', 'asset_3')} />
      <Link href="/about">
        <LinkContainer>
          <NextPageLink
            size={FontSize.lg}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Get ZIL, Give ZIL
          </NextPageLink>
          <Img
            src="/icons/arrow.svg"
            css="height: 20px;width: 30px;margin-left: 10px;"
          />
        </LinkContainer>
      </Link>
      <RedCrossContainer>
        <Illustration src={getImg(dirName, browserState.format, 'asset')} />
        <HashTag src={getImg('SVG', 'svg', 'asset_1')} />
      </RedCrossContainer>
    </React.Fragment>
  );
};

export default RedCross;
