import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';

import { Fonts, FontSize, FontColors } from 'config';

export const CardContainer = styled.div`
  border: 1px solid #5c63ef;
  padding: 0 .5rem 0;
  width: fit-content;
  min-width: 120px;
  border-radius: 35px;
  background-color: ${FontColors.primary};
  flex-basis: 15px;

  ${(props: { css: string; }) => props.css}
`;

type Prop = {
  title: string;
  css?: string;
};

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
        css="text-indent: 15px;"
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
