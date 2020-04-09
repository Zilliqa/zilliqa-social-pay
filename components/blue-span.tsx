import styled from 'styled-components';

import { FontColors, Fonts } from 'config';

type Prop = {
  css?: string;
};

/**
 * Span for for highlighting.
 * @prop css - Any css code.
 * @example
 * import { Span } from 'components/blue-span';
 * <Span>
 *   #Zilliqa
 * </Span>
 * <Span css="font-size: 5.5rem;">
 *   #ZilPay
 * </Span>
 */
export const Span = styled.span`
  ${(props: Prop) => props.css}
  color: ${FontColors.white};
  font-family: ${Fonts.AvenirNextLTProBold};
`;
