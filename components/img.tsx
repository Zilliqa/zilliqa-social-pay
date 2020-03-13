import styled from 'styled-components';

type Prop = {
  css?: string;
};

export const Img = styled.img`
  height: fit-content;
  width: fit-content;

  ${(props: Prop) => props.css}
`;

Img.defaultProps = {
  css: ''
};