import React from 'react';
import styled from 'styled-components';

type Content = {
  show: boolean;
};

export const ModalContent = styled.aside`
  display: ${(props: Content) => props.show ? 'block' : 'none'};

  position: fixed;
  bottom: 50%;
  left: 40%;
  right: 40%;
  top: 20%;

  height: 100%;

  z-index: 10;
  background-color: gray;
  height: fit-content;
  width: fit-content;
  animation: fadeInUp 0.4s;
  animation-timing-function: cubic-bezier(.3,.17,.23,.96);
`;
export const CloseContent = styled.div`
  display: ${(props: Content) => props.show ? 'block' : 'none'};

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

type Prop = {
  show: boolean;

  onBlur: () => void;
};

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
      </ModalContent>
    </React.Fragment>
  );
};
