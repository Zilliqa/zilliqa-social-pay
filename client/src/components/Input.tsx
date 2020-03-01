import styled from 'styled-components';

import { SizeComponent, Fonts } from 'src/config';

type Prop = {
  sizeVariant?: SizeComponent;
  fontVariant?: Fonts | string;
};

export const Input = styled.input`
  font-family: ${(props: Prop) => props.fontVariant};
  text-align: inherit;
  font-size: inherit;
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
  sizeVariant: SizeComponent.xs,
  fontVariant: Fonts.AvenirNextLTProRegular
};
