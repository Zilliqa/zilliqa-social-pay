import styled from 'styled-components';

import { FontSize, Fonts, FontColors, Sides } from 'src/config';

type Prop = {
  size?: FontSize | string;
  fontVariant?: Fonts | string;
  fontColors?: FontColors | string;
  nowrap?: boolean;
  align?: Sides;
}

export const Text = styled.p`
  font-family: ${(props: Prop) => props.fontVariant};
  font-size: ${(props: Prop) => props.size};
  color: ${(props: Prop) => props.fontColors};
  white-space: ${(props: Prop) => props.nowrap ? 'nowrap' : 'normal'};
  text-align: ${(props: Prop) => Sides[props.align || Sides.left]};

  font-style: normal;
  font-weight: normal;

  overflow: hidden;
  text-overflow: ellipsis;
`;

Text.defaultProps = {
  size: FontSize.xs,
  fontVariant: Fonts.AvenirNextLTProRegular,
  fontColors: FontColors.black,
  nowrap: false,
  align: Sides.left
};
