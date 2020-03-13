import styled from 'styled-components';

type Prop = {
  css?: string;
};

export const Jumbotron = styled.div`
  padding: 1rem;
  background-color: transparent;
  border-radius: .3rem;
  border: 1px solid #e9ecef;

  ${(props: Prop) => props.css}
`;
Jumbotron.defaultProps = {
  css: ''
};
