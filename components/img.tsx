import styled from 'styled-components';

type Prop = {
  css?: string;
};

/**
 * Container for any imgs and for extends.
 * @prop css - Any css code.
 * @example
 * import { Img } from 'components/container';
 * <Img src="/icons/test.svg"/>
 */
export const Img = styled.img`
  height: fit-content;
  width: fit-content;

  ${(props: Prop) => props.css}
`;

Img.defaultProps = {
  css: ''
};