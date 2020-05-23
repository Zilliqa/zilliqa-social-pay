import styled from 'styled-components';

/**
 * Around component for any content.
 */
export const AroundedContainer = styled.form`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;

  background-color: rgba(92, 99, 239, 0.7019607843137254);
  width: 300px;
  min-height: 400px;
  z-index: 1;
  border-radius: 20px;

  margin-left: 10%;
  padding-top: 70px;
  padding-bottom: 70px;

  @media (max-width: 600px) {
    margin: 0;
    width: 310px;
  }

  ${(props: { css?: string; }) => props.css}
`;
