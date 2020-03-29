import styled from 'styled-components';
import { Img } from 'components/img';

/**
 * Just loader in center screen.
 */
export const MiniLoader = styled(Img)`
  animation:spin 4s linear infinite;
`;

MiniLoader.defaultProps = {
  src: '/icons/loader.svg'
};
