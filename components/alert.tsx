import styled from 'styled-components';

import { AlertVariants } from 'config';

type Prop = {
  css?: string;
  variant?: AlertVariants;
};

export const Alert = styled.div`
  position: relative;
  padding: .4rem;
  border: 1px solid transparent;
  border-radius: .25rem;
  width: fit-content;

  ${(props: Prop) => props.css}
  ${(props: Prop) => props.variant}
`;

Alert.defaultProps = {
  css: '',
  variant: AlertVariants.primary
};
