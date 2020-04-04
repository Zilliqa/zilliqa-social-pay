import styled from 'styled-components';

/**
 * Around component for any content.
 */
export const AroundedContainer = styled.form`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;

  background-color: #5c63efb3;
  width: 300px;
  min-height: 400px;
  z-index: 1;
  border-radius: 20px;

  margin-left: 10%;
  padding-top: 70px;
  padding-bottom: 70px;

  transition: all 1s ease-out;

  @media (max-width: 400px) {
    margin: 0;
    width: 310px;
  }
`;
