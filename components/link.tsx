import styled from 'styled-components';

type Prop = {
  css?: string;
};

export const Link = styled.a`
  color: #00ffff;

  :active {
    color: #00ffff;
    text-decoration: underline;
  }

  :hover {
    color: #00caca;
    text-decoration: underline;
  }

  :visited {
    text-decoration: none;
  }

  ${(props: Prop) => props.css}
`;

Link.defaultProps = {
  css: ''
};

export default Link;
