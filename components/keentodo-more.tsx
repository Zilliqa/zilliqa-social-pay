import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  css?: string;
};

export const KeentodoMore = styled.div`
  display: flex;
  align-items: center;

  background-color: #3859ff;
  border-radius: 20px;
  padding: 10px;
  width: 300px;
  hight: auto;
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
