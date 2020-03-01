import styled from 'styled-components';

import { FontSize } from 'src/config';

type Prop = {
  size?: FontSize | string;
}

export const Text = styled.p`
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;

  font-size: ${(props: Prop) => props.size};
  line-height: 12px;
`;

Text.defaultProps = {
  size: FontSize.xs
};
