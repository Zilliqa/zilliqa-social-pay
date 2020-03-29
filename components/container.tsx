import styled from 'styled-components';

type Prop = {
  area?: string;
  css?: string;
};

/**
 * Container for any content and for extends.
 * @prop css - Any css code.
 * @prop area - Css grid property.
 * @example
 * import { Container } from 'components/container';
 * <Container>
 *   Any content.
 * </Container>
 */
export const Container = styled.div`
  max-width: 100vw;

  margin-right: auto;
  margin-left:  auto;

  ${(props: Prop) => props.css}
  ${(props: Prop) => props.area ? `grid-area: ${props.area};` : ''}
`;

Container.defaultProps = {
  css: ''
};
