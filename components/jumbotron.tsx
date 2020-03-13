import styled from 'styled-components';

type Prop = {
  css?: string;
};

export const Jumbotron = styled.div`
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: .3rem;

  ${(props: Prop) => props.css}
`;
Jumbotron.defaultProps = {
  css: ''
};
