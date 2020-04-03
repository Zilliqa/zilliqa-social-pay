import React from 'react';
import styled from 'styled-components';

import { Container } from 'components/container';

import { FontColors } from 'config';

type CircleProp = {
  color: string;
};
type ProgressContainerProp = {
  height: number | string;
  width: number | string;
};
type Prop = {
  height?: number | string;
  width?: number | string;
  pct: number;
  coefficient? : number;
};

const ProgressContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;

  :before {
    position: absolute;
    display: block;
    height: ${(props: ProgressContainerProp) => props.height}px;
    width: ${(props: ProgressContainerProp) => props.width}px;
    box-shadow: inset 0 0 1em ${FontColors.white};
    content: attr(data-pct)"%";
    border-radius: 100%;
    line-height: ${(props: ProgressContainerProp) => props.height}px;
    font-size: 1em;
    text-shadow: 0 0 0.5em ${FontColors.white};
    text-align: center;
    color: ${FontColors.white};
  }
`;
const SVG = styled.svg`
  z-index: 1;
`;
const Circle = styled.circle`
  transition: stroke-dashoffset 1s linear;
  stroke-width: 1em;

  r: 90;
  cx: 100;
  cy: 100;
  fill: transparent;
  stroke-dasharray: 565.48;
  stroke-dashoffset: 0;

  stroke: ${(props: CircleProp) => props.color};
`;

const DEFAULT_RADIUS = 90;
const _100 = 100;
const _2 = 2;

export const ProgressCircle: React.FC<Prop> = ({
  width,
  height,
  pct,
  coefficient
}) => {
  const [dashoffset, setDashoffset] = React.useState<number>(0);

  React.useEffect(() => {
    const c = Math.PI * (DEFAULT_RADIUS * _2);

    setDashoffset(((_100 - pct) / _100) * c);
  }, [
    dashoffset,
    setDashoffset,
    pct
  ]);

  return (
    <ProgressContainer
      height={Number(height) - Number(coefficient)}
      width={Number(width) - Number(coefficient)}
      data-pct={pct}
    >
      <SVG
        height={height}
        width={width}
        viewBox={`0 0 ${Number(width) * _2} ${Number(height) * _2}`}
      >
        <Circle color="#fff"/>
        <Circle
          color="#5c63ef"
          style={{
            strokeDashoffset: dashoffset,
            strokeWidth: '1.2em'
          }}
        />
      </SVG>
    </ProgressContainer>
  );
};

ProgressCircle.defaultProps = {
  width: 100,
  height: 100,
  coefficient: 10
};