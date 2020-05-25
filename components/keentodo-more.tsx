import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  css?: string;
};

export const KeentodoMore = styled.div`
  display: flex;

  background-color: rgba(56, 89, 255, 0.86);
  border-radius: 20px;
  padding: 1rem;
  width: 300px;
  border: 1px solid ${FontColors.white};

  margin-left: 10%;
  margin-top: 10px;

  @media (max-width: 1023px) {
    margin: 0;
    margin-top: 10px;
  }

  ${(props: Prop) => props.css}
`;

KeentodoMore.defaultProps = {
  css: ''
};

export default KeentodoMore;
