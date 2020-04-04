import React from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';

import { Img } from 'components/img';
import { Container } from 'components/container';

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

const customStyles = {
  content : {
    top : '50%',
    left : '50%',
    right : 'auto',
    bottom : 'auto',
    marginRight : '-50%',
    transform : 'translate(-50%, -50%)',
    background: 'transparent',
    border: 0
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.46)'
  }
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
}) => (
  <ReactModal
    style={customStyles}
    isOpen={show}
    ariaHideApp={false}
    onRequestClose={onBlur}
  >
    <Container css="display: flex;">
      {children}
      <CloseIcon onClick={onBlur}/>
    </Container>
  </ReactModal>
);
