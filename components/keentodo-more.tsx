import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  css?: string;
};

export const KeentodoMore = styled.div`
  display: flex;

  background-color: #5471FF;
  border-radius: 20px;
  padding: 1rem;
  width: 300px;
  margin-left: 10%;
  margin-top: 10px;
  border: 1px solid ${FontColors.white};

  @media (max-width: 400px) {
    margin-left: 0;
  }

  ${(props: Prop) => props.css}
`;

KeentodoMore.defaultProps = {
  css: ''
};

export default KeentodoMore;
