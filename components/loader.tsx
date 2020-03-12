import styled from 'styled-components';

type Prop = {
  load: boolean;
};

export const Loader = styled.div`
  display: ${(props: Prop) => props.load ? 'block' : 'none'};
`;
