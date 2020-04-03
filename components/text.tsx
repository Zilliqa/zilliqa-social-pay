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

/**
 * Text css container for any strings.
 * @example
 * import { Text } from 'components/text';
 * import { FontSize, Fonts, FontColors } from 'config';
 * <Text
 *   size={FontSize.sm}
 *   fontVariant={Fonts.AvenirNextLTProDemi}
 *   fontColors={FontColors.white}
 * >
 *   Any text
 * </Text>
 */
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

  margin-block-start: 0.6em;
  margin-block-end: 0.6em;

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
