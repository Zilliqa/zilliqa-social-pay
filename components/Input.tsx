import React from 'react';
import styled from 'styled-components';

import { SizeComponent, Fonts, FontColors, ButtonVariants } from 'config';

type Prop = {
  sizeVariant?: SizeComponent;
  fontVariant?: Fonts | string;
  variants?: ButtonVariants;
  css?: string;
};

/**
 * Input css component.
 * @example
 * import { Input } from 'components/Input';
 * import { SizeComponent, ButtonVariants } from 'config';
 * <Input
 *   sizeVariant={SizeComponent.md}
 *   variants={ButtonVariants.primary}
 *   css="font-size: 15px;width: 300px;"
 * />
 */
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
  ${(props: Prop) => props.variants}

  transition: all .5s ease-out;

  ${(props: Prop) => props.css}

  :focus {
    outline: none;
  }
  :disabled {
    opacity: 0.5;
    cursor: unset;
  }
  ::placeholder {
    color: ${FontColors.white};
    opacity: 0.6;
  }

  @media (max-width: 370px) {
    max-width: 300px;
  }
`;
Input.defaultProps = {
  sizeVariant: SizeComponent.xs,
  fontVariant: Fonts.AvenirNextLTProRegular,
  css: '',
  variants: ButtonVariants.primary
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
  font-size: 15px;
  margin-top: 5px;
`;
/**
 * Search input css component with search icon.
 */
export const Search = styled(Input)`
  background: #5C63EF url(/icons/search-icon.svg) no-repeat 9px center;
  text-align: center;
  color: ${FontColors.white};
  text-indent: 30px;
`;

type FieldProp = {
  error?: string;
  title?: string;
} & Prop & any & React.HTMLProps<HTMLInputElement>;

/**
 * FieldInput component with the title and error msg.
 * @prop error - Any error string.
 * @prop title - Any title string.
 * @example
 * import { FieldInput } from 'components/Input';
 * import { SizeComponent, ButtonVariants } from 'config';
 * const err = null;
 * const value = 'example';
 * <FieldInput
 *   defaultValue={value}
 *   sizeVariant={SizeComponent.md}
 *   variants={ButtonVariants.primary}
 *   error={err}
 *   css="width: 100px;"
 * />
 */
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
