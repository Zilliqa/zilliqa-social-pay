import styled from 'styled-components';

import { Text } from 'components/text';

export const TextWarning = styled(Text)`
  display: flex;
  align-items: center;
  color: #00ffff;
  font-size: 12px;

  :before {
    content: url(/icons/warn_1.svg);
    margin-right: 10px;
  }
`;
