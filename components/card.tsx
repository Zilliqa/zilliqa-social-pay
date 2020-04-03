import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';

import { Fonts, FontSize, FontColors } from 'config';

/**
 * Around css Container for card component.
 * @prop css - Any css code.
 * @example
 * import { CardContainer } from 'components/card';
 * <CardContainer>
 *   any content.
 * </CardContainer>
 */
export const CardContainer = styled.div`
  border: 1px solid #5c63ef;
  padding: 0 .5rem 0;
  width: fit-content;
  border-radius: 35px;
  background-color: #5c63efb5;
  flex-basis: 15px;

  ${(props: { css: string; }) => props.css}
`;

type Prop = {
  title: string;
  css?: string;
};

/**
 * Card component.
 * @prop title Card title, show on top, left position.
 * @prop css - Any css code.
 * @example
 * import { Card } from 'components/card';
 * <Card title="example title">
 *   Any content.
 * </Card>
 */
export const Card: React.FC<Prop> = ({
  title,
  children,
  css = ''
}) => {
  return (
    <CardContainer css={css}>
      <Text
        fontVariant={Fonts.AvenirNextLTProDemi}
        fontColors={FontColors.white}
        css="text-indent: 15px;padding-top: 10px;"
      >
        {title}
      </Text>
      <Text
        fontVariant={Fonts.AvenirNextLTProBold}
        size={FontSize.md}
      >
        {children}
      </Text>
    </CardContainer>
  );
};
