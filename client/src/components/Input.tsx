import React from 'react';
import styled from 'styled-components';

import { SizeComponent } from 'src/config';

type Prop = {
  sizeVariant: SizeComponent;
};

export const Input = styled.input`
  text-align: inherit;
  font-size: inherit;
  font-family: inherit;
  resize: none;
  text-indent: 15px;

  padding: ${(props: Prop) => props.sizeVariant};

  width: 100%;
  border: 0;

  border-radius: 35px;
  background: #E5E5E5;

  transition: all .5s ease-out;

  :focus {
    outline: none;
  }
`;

Input.defaultProps = {
  sizeVariant: SizeComponent.xs
};
