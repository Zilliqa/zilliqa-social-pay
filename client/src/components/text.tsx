import styled from 'styled-components';

import { FontSize, Fonts } from 'src/config';

type Prop = {
  size?: FontSize | string;
  fontVariant?: Fonts | string;
}

export const Text = styled.p`
  font-family: ${(props: Prop) => props.fontVariant};
  font-style: normal;
  font-weight: normal;

  font-size: ${(props: Prop) => props.size};
  line-height: 12px;
`;

Text.defaultProps = {
  size: FontSize.xs,
  fontVariant: Fonts.AvenirNextLTProRegular
};
