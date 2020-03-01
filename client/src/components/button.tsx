import styled from 'styled-components';

import { ButtonVariants } from 'src/config';

type Prop = {
  variant?: ButtonVariants;
}

export const Button = styled.button`
  cursor: pointer;
  min-width: 100px;
  background: #29CCC4;
  border-radius: 30px;
  border: 0;
  ${(props: Prop) => props.variant}

  :focus {
    outline: none;
  }
`;

Button.defaultProps = {
  variant: ButtonVariants.primary
};
