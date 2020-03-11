import styled from 'styled-components';

import { FontSize, Fonts, FontColors, Sides } from 'config';

type Prop = {
  size?: FontSize | string;
  fontVariant?: Fonts | string;
  fontColors?: FontColors | string;
  nowrap?: boolean;
  align?: Sides;
  upperCase?: boolean;
  css?: string;
};

export const Text = styled.div`
  font-family: ${(props: Prop) => props.fontVariant};
  font-size: ${(props: Prop) => props.size};
  color: ${(props: Prop) => props.fontColors};
  white-space: ${(props: Prop) => props.nowrap ? 'nowrap' : 'normal'};
  text-align: ${(props: Prop) => Sides[props.align || Sides.left]};
  text-transform: ${(props: Prop) => props.upperCase ? 'uppercase' : 'initial'};

  font-style: normal;
  font-weight: normal;

  overflow: hidden;
  text-overflow: ellipsis;

  margin-block-start: 1em;
  margin-block-end: 1em;

  ${(props: Prop) => props.css}
`;

Text.defaultProps = {
  size: FontSize.xs,
  fontVariant: Fonts.AvenirNextLTProRegular,
  fontColors: FontColors.black,
  nowrap: false,
  align: Sides.left,
  upperCase: false,
  css: ''
};
