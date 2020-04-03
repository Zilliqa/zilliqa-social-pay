import styled from 'styled-components';

import { FontColors } from 'config';

type Prop = {
  show?: boolean;
  css?: string;
};

/**
 * Full screen container for loading.
 * @prop css - Any css code.
 * @prop show -Show or hidden component.
 * @example
 * import { ContainerLoader } from 'components/container-loader';
 * import { FixedWrapper } from 'components/fixed-wrapper';
 * <FixedWrapper>
 *   <ContainerLoader />
 * </FixedWrapper>
 */
export const ContainerLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: ${(props: Prop) => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  background-color: ${FontColors.black};
  opacity: 0.5;
  animation: fade 0.4s;
  animation-timing-function: cubic-bezier(.3,.17,.23,.96);
`;
ContainerLoader.defaultProps = {
  css: ''
};
