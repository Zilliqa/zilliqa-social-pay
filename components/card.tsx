import React from 'react';
import styled from 'styled-components';

import { Text } from 'components/text';

import { Fonts, FontSize } from 'config';

export const CardContainer = styled.div`
  border: 1px solid #ececec;
  padding: 0 .5rem 0;
  width: fit-content;
  min-width: 120px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 1px 5px 6px -2px #ccc;
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
      <Text fontVariant={Fonts.AvenirNextLTProDemi}>
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
