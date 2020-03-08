import React from 'react';
import styled from 'styled-components';

import { SizeComponent, Fonts, FontColors } from 'config';

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
export const FieldLabel = styled.label`
  display: grid;
  justify-items: left;
  width: 100%;
`;
export const InputTitle = styled.div`
  text-indent: 15px;
`;
export const InputError = styled.div`
  text-indent: 15px;
  color: ${FontColors.danger};
`;
export const Search = styled(Input)`
  background: #ededed url(/icons/search-icon.svg) no-repeat 9px center;
  text-align: center;
`;

type FieldProp = {
  error?: string;
  title?: string;
} & Prop & any & React.HTMLProps<HTMLInputElement>;

export const FieldInput: React.FC<FieldProp> = ({
  error,
  title,
  ...parentProps
}) => {

  return (
    <FieldLabel>
      <InputTitle>
        {title}
      </InputTitle>
      <Input {...parentProps} />
      <InputError>
        {error}
      </InputError>
    </FieldLabel>
  );
};
