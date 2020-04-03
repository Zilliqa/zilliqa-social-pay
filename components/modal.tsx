import React from 'react';
import styled from 'styled-components';

import { Img } from 'components/img';

type ContentContainerProp = {
  show: boolean;
};

export const ModalContent = styled.aside`
  display: ${(props: ContentContainerProp) => props.show ? 'flex' : 'none'};

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  height: fit-content;
  width: fit-content;
  z-index: 6;

  @media (max-width: 370px) {
    max-width: 300px;
    left: 0;
    right: 0;
    transform: translate(10%,-50%);
  }
`;
export const CloseContent = styled.div`
  display: ${(props: ContentContainerProp) => props.show ? 'block' : 'none'};

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;

  cursor: pointer;
  background-color: #000;
  z-index: 5;
  opacity: 0.5;
  animation: fade 0.4s;
  animation-timing-function: cubic-bezier(.3,.17,.23,.96);
`;
export const CloseIcon = styled(Img)`
  cursor: pointer;
  height: 20px;
  width: 20px;
`;
CloseIcon.defaultProps = {
  src: '/icons/close-1.svg'
};

type Prop = {
  show: boolean;
  onBlur: () => void;
};

/**
 * Modal container component.
 * @prop show - Show or hidden component.
 * @prop onBlur - Event when user click outside.
 * @example
 * import { Modal } from 'components/modal';
 * const isShow = true;
 * <Modal
 *   show={isShow}
 *   onBlur={() => / do something... /}
 * >
 */
export const Modal: React.FC<Prop> = ({
  children,
  show,
  onBlur
}) => {
  return (
    <React.Fragment>
      <CloseContent
        show={show}
        onClick={() => onBlur()}
      />
      <ModalContent show={show}>
        {children}
        <CloseIcon onClick={() => onBlur()}/>
      </ModalContent>
    </React.Fragment>
  );
};
