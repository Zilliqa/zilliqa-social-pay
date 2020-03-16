import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  area?: string;
  css?: string;
};

export const Span = styled.span`
  ${(props: Prop) => props.css}
  color: ${FontColors.info};
`;
