import styled from 'styled-components';

type Prop = {
  area?: string;
  css?: string;
};

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
