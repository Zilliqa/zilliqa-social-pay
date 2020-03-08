import styled from 'styled-components';

import { ButtonVariants, SizeComponent, Fonts } from 'config';

type Prop = {
  variant?: ButtonVariants;
  sizeVariant?: SizeComponent;
  fontVariant?: Fonts | string;
}

export const Button = styled.button`
  cursor: pointer;

  min-width: 100px;

  border: 0;
  border-radius: 30px;

  font-family: ${(props: Prop) => props.fontVariant};
  ${(props: Prop) => props.variant}
  padding: ${(props: Prop) => props.sizeVariant};

  :focus {
    outline: none;
  }

  :disabled {
    opacity: 0.5;
    cursor: unset;
  }
`;

Button.defaultProps = {
  variant: ButtonVariants.primary,
  sizeVariant: SizeComponent.xs,
  fontVariant: Fonts.AvenirNextLTProDemi
};
