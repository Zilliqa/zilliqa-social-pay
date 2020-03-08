import styled from 'styled-components';

import { Text } from 'components/text';

import { Fonts, FontSize } from 'config';

export const CardContainer = styled.div`
  border: 1px solid #ececec;
  padding: 0 .5rem 0;
  width: fit-content;
  min-width: 100px;
  border-radius: 5px;
  box-shadow: 1px 1px 5px #aaaaaa;
`;

type Prop = {
  title: string;
};

export const Card: React.FC<Prop> = ({
  title,
  children
}) => {
  return (
    <CardContainer>
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
